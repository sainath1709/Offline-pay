from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import time
import random

import numpy as np
from datetime import datetime
from sklearn.ensemble import IsolationForest

app = FastAPI(title="OfflinePay ML Risk Engine")

# Train a dummy Isolation Forest model on startup
# In production, this would load a pre-trained model pickle file.
X_train = np.array([
    [100, 0], [200, 0], [50, 0], [1500, 0], [300, 0],
    [5000, 1], [10000, 1], [8000, 1] # Outliers (High amount, expired)
])
ml_model = IsolationForest(contamination=0.1, random_state=42)
ml_model.fit(X_train)

class Transaction(BaseModel):
    transactionId: str
    voucherId: str
    amount: float
    scannedAt: str
    expiresAt: str

class SyncBatchRequest(BaseModel):
    merchantId: str
    transactions: List[Transaction]

class RiskAssessment(BaseModel):
    transactionId: str
    riskScore: float
    anomalyFlags: List[str]
    action: str

@app.post("/analyze_risk", response_model=List[RiskAssessment])
def analyze_risk(batch: SyncBatchRequest):
    """
    Analyzes offline transactions using Isolation Forest ML model.
    """
    assessments = []
    
    for tx in batch.transactions:
        risk_score = 0.1
        flags = []
        is_expired = 0
        
        # Parse times
        try:
            # Handle frontend ISO string format correctly
            scanned_time = datetime.fromisoformat(tx.scannedAt.replace('Z', '+00:00'))
            expire_time = datetime.fromisoformat(tx.expiresAt.replace('Z', '+00:00'))
            if scanned_time > expire_time:
                is_expired = 1
                flags.append("SCANNED_POST_EXPIRATION")
        except Exception as e:
            pass
            
        # ML Inference: Predict anomaly using Isolation Forest
        # Features: [Amount, IsExpired]
        features = np.array([[tx.amount, is_expired]])
        prediction = ml_model.predict(features) # returns 1 (normal) or -1 (anomaly)
        decision_score = ml_model.decision_function(features)[0] # negative means anomaly
        
        if prediction[0] == -1:
            flags.append("ML_ANOMALY_DETECTED")
            risk_score += abs(decision_score) + 0.5 # Boost risk score based on ML confidence
            
        # Hard cap rules
        if tx.amount > 5000:
            flags.append("EXTREME_VALUE")
            risk_score += 0.4
            
        risk_score = min(round(risk_score, 2), 1.0)
        
        # Determine action
        action = "APPROVE"
        if risk_score >= 0.8:
            action = "REJECT"
        elif risk_score >= 0.5:
            action = "REVIEW"
            
        assessments.append(RiskAssessment(
            transactionId=tx.transactionId,
            riskScore=risk_score,
            anomalyFlags=flags,
            action=action
        ))
        
    return assessments

@app.get("/health")
def health_check():
    return {"status": "healthy"}
