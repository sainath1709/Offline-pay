const nodemailer = require("nodemailer");

/**
 * Send an email receipt for a transaction.
 * Uses Ethereal Email (mock SMTP) by default for development.
 * 
 * @param {string} toEmail - The recipient's email address
 * @param {string} subject - The subject of the email
 * @param {string} body - The HTML body of the email
 */
const sendEmailReceipt = async (toEmail, subject, body) => {
    try {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"OfflinePay Alerts" <no-reply@offlinepay.com>', // sender address
            to: toEmail, // list of receivers
            subject: subject, // Subject line
            html: body, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = {
    sendEmailReceipt
};
