module.exports = {
  companyName: 'My Company',
  rootUrl: 'http://mycompany.com',
  // database: {
  //   host: 'AWS Database',
  //   port: 'AWS Port',
  //   user: 'AWS Username',
  //   password: 'AWS Password',
  //   database: 'postgres'
  // },
  database: {
    host: 'postgres.cs1fhpxvmgcn.us-west-2.rds.amazonaws.com',
    port: '5432',
    user: 'jakedluhy',
    password: 'cutekittensarecute',
    database: 'postgres'
  },
  redis: {
    port: 6379,
    host: 'myRedisClusterEndpoint'
  },
  redisPrefix: 'ember-boilerplate:index:',
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
  //   username: 'myGmailAccount',
  //   password: 'myGmailPassword'
  // },
  // feedbackEmail: 'myFeedbackEmail',
  // contactEmail: 'myContactEmail'
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
  contactEmail: 'warscribe.contact@gmail.com'
}