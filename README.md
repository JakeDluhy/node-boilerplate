# A Boilerplate for developing applications with Node
This is a boilerplate application for developing using Node.js, with Bookshelf and Express. Although this can work as an api server for any frontend, it was specifically developed to be used with the [ember-boilerplate](https://github.com/JakeDluhy/ember-boilerplate) application I've created. The idea is that using these boilerplates as a starting point, you can go from 0 to a deployed (on AWS), production, user ready application in 1-2 hours.

## Requirements
* node ([https://nodejs.org/en/](https://nodejs.org/en/))
* npm ([https://www.npmjs.com/](https://www.npmjs.com/))
* postgres ([http://www.postgresql.org/](http://www.postgresql.org/))
* redis ([http://redis.io/](http://redis.io/))

## Getting started
* Clone the repository `git clone`
* Install packages 'npm install && bower install'
* Modify the config files (development, test, production) - [See this section](#modifyConfig)
* Make sure the db is created in postgres `createdb my_db_name`
* Migrate the db `NODE_ENV='development' knex migrate:latest`
* Start the server with `NODE_ENV='development' grunt server`

## <a name="modifyConfig"></a>Modifying config files
In order to provide config files for three different environments (development, test, and production), there are three different files that should have identical keys in them. The values stored in those keys should reflect the desired configuration for that environment.
* companyName should be the same accross environments
* rootUrl should be http://localhost:4200 locally, and the url to your web application for production
* For the local database, host should be `127.0.0.1`, user should correspond to your computer user, password can be empty, and database should match the name of the database created using `createdb`
* For the production database, this information will be filled in once you set up a DB on your AWS account
* There should be no need to change anything for redis locally, but once you set up a cluster on AWS the redis endpoint will need to be added
* jwtSecret and sessionSecret are secret strings to use for the jwtKey and express session
* I like using mailchimp to manage an email list. In order to take advantage of this you will need to register a free [mailchimp account](https://login.mailchimp.com/signup?pid=GAW), generate an apiKey, and a mailing list with a specific ID. I also made it so that you can create different groups in your mailchimp list, to determine who signed up exclusively for the mailing list, and who registered as a full user
* This app uses nodemailer with the gmail service. In order to configure this you simply need to sign up for a gmail account and set the email and password in the username and password fields
* Set the feedbackEmail to whatever email you would like feedback from the site sent to
* Set the contactEmail to whatever you would like contact from users sent to

## Setting up resources and deploying