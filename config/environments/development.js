module.exports = {
  companyName: 'My Company',
  rootUrl: 'http://localhost:4200',
  database: {
    host: '127.0.0.1',
    user: 'jake',
    password: '',
    database: 'my_db'
  },
  // jwtSecret: 'mysecrethere',
  // sessionSecret: 'mysecrethere',
  // mailchimp: {
  //   apiKey: '',
  //   apiRoot: 'https://us11.api.mailchimp.com/3.0/',
  //   mailingListId: '',
  //   signupPathCategory: {
  //     categoryId: '',
  //     registeredUserId: '',
  //     mailingListId: ''
  //   }
  // },
  // nodemailer: {
  //   username: 'warscribe.contact@gmail.com',
  //   password: 'cutekittensarecute'
  // },
  // feedbackEmail: 'myFeedbackEmail',
  // contactEmail: 'myContactEmail',
  // googleAnalytics: {
  //   trackingID: ''
  // }
  jwtSecret: 'mysecrethere',
  sessionSecret: 'mysecrethere',
  mailchimp: {
    apiKey: '8eeafe0cb2c34e83b695faad724427e9-us11',
    apiRoot: 'https://us11.api.mailchimp.com/3.0/',
    mailingListId: '0f7da84c40',
    signupPathCategory: {
      categoryId: 'd2337ba10a',
      registeredUserId: 'f6fdbeea6e',
      mailingListId: '0ece627f4b'
    }
  },
  nodemailer: {
    username: 'warscribe.contact@gmail.com',
    password: 'cutekittensarecute'
  },
  feedbackEmail: 'warscribe.feedback@gmail.com',
  contactEmail: 'warscribe.contact@gmail.com',
  googleAnalytics: {
    trackingID: 'UA-67296627-1'
  }
}