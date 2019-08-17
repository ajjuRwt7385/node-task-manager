const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY=process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SENDGRID_API_KEY);

// sgMail.send({
//     to: 'ajayrawat7385@gmail.com',
//     from: 'ajayrawat7385@gmail.com',
//     subject: 'Testing email from node app using SendGrid service',
//     text: 'Hey there!'
// })

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ajay@wootag.com',
        subject: 'Thank you for joining in to Task App!',
        text: `Hey ${name}! Hope you're doing good. Let me know your experience with the app!`
    })
}

const sendAccountDeletionEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ajay@wootag.com',
        subject: 'Account Deleted Successfully!',
        text: `Hey ${name},\nWe respect your decision to delete your account and would appreciate if you can tell us a little more how we can improve your experience using the App.\nThanks,\nAjay`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendAccountDeletionEmail
}