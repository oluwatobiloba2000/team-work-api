import sendGrid from '@sendgrid/mail';

const { SENDGRID_API_KEY } = process.env;

/**
 * Sends email notifications to admin and users
 *
 * @class - The EmailSender class
 */
class EmailSender {
  /**
   * Sends an email to a recipient
   *
   * @param {String} userEmail - The email address of the recipent
   * @param {String} mailSubject - The subject of the mail
   * @param {String} mailBody - The mail/message body
   */
  static async sendInviteMails(
    recieverEmail,
    orgId,
    orgName,
    inviteKey,
  ) {
    const message = {
      fromname: 'Teamily',
      from: `Teamily <${process.env.SENDGRID_EMAIL}>`,
      to: recieverEmail,
      replyto: 'ananioluwatobiloba2000@gmail.com',
      subject: 'You have been invited',
      html: `<body>
               <p>You have been invited to Join <h2>${orgName}</h2> Organization on Teamily</p>
               <p>An admin in ${orgName} on Teamily Invited you to join the organization,
               click on Accept Invite to accept the invitation</p>
               <a style="padding: 5px; border: 1px solid black; width: 250px;" href="https://teamily.netlify.app/accept/invite?email=${recieverEmail}&organizationID=${orgId}&org=${orgName}&inviteKey=${inviteKey}">
                Accept Invite
               </a>
               <br>
               <p>Or copy and paste this link in your browser</p>

               <div style="background-color: #80808036;">
                 https://teamily.netlify.app/accept/invite?email=${recieverEmail}&organizationID=${orgId}&org=${orgName}&inviteKey=${inviteKey}
               </div>
                <p style="padding: .5em;"> <a href="https://teamily.netlify.app">New To Teamily?</a></p>
              </body>`,
    };

    sendGrid.setApiKey(SENDGRID_API_KEY);
    sendGrid
      .send(message)
      .then(() => true)
      .catch((err) => console.log(err.response.body));
  }
}

export default EmailSender;
