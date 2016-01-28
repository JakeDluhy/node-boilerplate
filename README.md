# A Boilerplate for developing applications with Node

This is a boilerplate application for developing using Node.js, with Bookshelf and Express. Although this can work as an api server for any frontend, it was specifically developed to be used with the [ember-boilerplate](https://github.com/JakeDluhy/ember-boilerplate) application I've created. The idea is that using these boilerplates as a starting point, you can go from 0 to a deployed (on AWS), production, user ready application in 1-2 hours.

## Requirements

* Git ([http://git-scm.com/](http://git-scm.com/))
* Node ([https://nodejs.org/en/](https://nodejs.org/en/))
* npm ([https://www.npmjs.com/](https://www.npmjs.com/))
* postgres ([http://www.postgresql.org/](http://www.postgresql.org/))
* redis ([http://redis.io/](http://redis.io/))

## Getting started

* Clone the repository `git clone`
* Install packages `npm install`
* Modify the config files (development, test, production) - [See this section](#modifyConfig)
* Make sure the db is created in postgres `createdb my_db_name`
* Migrate the db `NODE_ENV='development' knex migrate:latest`
* Start the server with `NODE_ENV='development' grunt server`

## <a name="modifyConfig"></a>Modifying config files

In order to provide config files for three different environments (development, test, and production), there are three different files that should have identical keys in them. The values stored in those keys should reflect the desired configuration for that environment.
* companyName should be the same accross environments
* rootUrl should be http://localhost:4200 locally, and the url to your web application for production
* For the local database, host should be `127.0.0.1`, user should correspond to your computer user, password can be empty, and database should match the name of the database created using `createdb`
* For the test database, host should be `127.0.0.1`, user should correspond to your computer user, password can be empty, and database should match the name of the database created using `createdb`. You should create a separate db for testing
* For the production database, this information will be filled in once you set up a DB on your AWS account
* There should be no need to change anything for redis locally, but once you set up a cluster on AWS the redis endpoint will need to be added
* jwtSecret and sessionSecret are secret strings to use for the jwtKey and express session
* I like using mailchimp to manage an email list. In order to take advantage of this you will need to register a free [mailchimp account](https://login.mailchimp.com/signup?pid=GAW), generate an apiKey, and a mailing list with a specific ID. I also made it so that you can create different groups in your mailchimp list, to determine who signed up exclusively for the mailing list, and who registered as a full user
* This app uses nodemailer with the gmail service. In order to configure this you simply need to sign up for a gmail account and set the email and password in the username and password fields
* Set the feedbackEmail to whatever email you would like feedback from the site sent to
* Set the contactEmail to whatever you would like contact from users sent to

## Setting up resources and deploying

Set up the AWS resources for deployment to production

### Create a gmail account

Start by creating a gmail account (or use an existing one) that you will be able to use for AWS, nodemailer, mailchimp, etc... [Gmail Signup](https://accounts.google.com/SignUp?service=mail&continue=http%3A%2F%2Fmail.google.com%2Fmail%2F%3Fpc%3Dtopnav-about-en)

### Create a mailchimp account

Just go to the [mailchimp signup page](https://login.mailchimp.com/signup) and sign up for an account.

#### Generate an apiKey

[Mailchimp docs](http://kb.mailchimp.com/accounts/management/about-api-keys)
* Click on your name (upper right) > Account > Extras > API Keys
* Scroll down and click Create A Key to generate your key
* Copy and paste the key into your environment variables

#### Create a list

[Mailchimp docs](http://mailchimp.com/resources/guides/getting-started-with-mailchimp/html/)
* On the navbar, click Lists > Create a List
* Fill in your details and click Save

#### Create Groups

[Mailchimp docs](http://kb.mailchimp.com/segments/add-groups-to-a-list?)
* For your list, click on the dropdown (on the right) > Manage Subscribers
* Click Groups > Create Groups
* Enter a title (Like 'Signup Choice') and Different Choices (Like 'Registered User' and 'Mailing List Only')

### Get your Mailchimp API ID's and fill in some of production.js

To get the the Mailchimp List Id and Group Ids, you need to go to the [Mailchimp API Playground](https://us11.api.mailchimp.com/playground/)
* Input your API Key, and select Lists > select your List
  * The id field has your mailingListId
  * Click the subresources dropdown > select interest-categories > select the Group Category you created
    * The id field has you categoryId
    * Click the subresources dropdown > select interests > choose each group in turn
      * For each group, the id field has the registeredUserId (for Registered User) and mailingListId (for Mailing List Only)

### Create an AWS account

The free AWS account lasts for 12 months and will give you basic features. Sign up [here](https://www.amazon.com/ap/signin?openid.assoc_handle=aws&openid.return_to=https%3A%2F%2Fsignin.aws.amazon.com%2Foauth%3Fresponse_type%3Dcode%26client_id%3Darn%253Aaws%253Aiam%253A%253A015428540659%253Auser%252Fawssignupportal%26redirect_uri%3Dhttps%253A%252F%252Fportal.aws.amazon.com%252Fbilling%252Fsignup%253Fnc2%253Dh_ct%2526redirect_url%253Dhttps%25253A%25252F%25252Faws.amazon.com%25252Fregistration-confirmation%2526state%253DhashArgs%252523%2526isauthcode%253Dtrue%26noAuthCookie%3Dtrue&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&action=&disableCorpSignUp=&clientContext=&marketPlaceId=&poolName=&authCookies=&pageId=aws.ssop&siteState=pre-register%2Cen_US&accountStatusPolicy=P1&sso=&openid.pape.preferred_auth_policies=MultifactorPhysical&openid.pape.max_auth_age=120&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&server=%2Fap%2Fsignin%3Fie%3DUTF8&accountPoolAlias=&forceMobileApp=0&language=en_US&forceMobileLayout=0)
After it is created and ready, sign in to the console

#### Create an IAM user

* In the top left, click on Services > Security and Identity > IAM
* Click on Groups (on the left)
* Click on Create New Group
  * Create a group called FullAdmin
  * Filter by 'FullAccess'
  * Select AmazonRDSFullAccess, AmazonEC2FullAccess, IAMFullAccess, AmazonElastiCacheFullAccess, AmazonS3FullAccess, and PowerUserAccess
  * Finish creating the group
* Click on Users (on the left)
* Click on Create New Users
  * Enter in a username for yourself, making sure to generate an access key for each user
  * Create the user, and download the CSV with the access key
* Click on Groups again
* Click on your FullAdmin group, and then Add Users to Group
* Select your IAM profile, and then Add Users to add yourself to the group

#### Create an s3 bucket

* [Amazon Docs](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AmazonS3.html)
* In the top left, click on Services > S3
* Click Create Bucket, and enter a name for your bucket (e.g. {app-name}-bucket)
* It's best to use the default region provided, but make sure to remember it and use it for the reset of your AWS services (because they all need to exist within the same Virtual Private Cloud)

#### Create a security group

[Amazon Docs](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_SecurityGroups.html)
* In the top left, click on Services > VPC
* On the left, scroll down to Security Groups
* Click Create Security Group
* Give it a name and description, and click Create

#### Create a redis elasticache cluster

[Amazon Docs](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/Clusters.Create.Redis.CON.html)
* In the top left, click on Services > Elasticache
* Click on Get Started Now
* Choose Redis
* Keep defaults for cluster specification
* For Configuration, choose an appropriate name and description. The rest of the fields can be left as defaults

#### Create an RDS instance

* [Amazon Docs](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html)
* In the top left, click on Services > RDS
* Click Get Started Now
* Choose PostgreSQL
* Select Dev/Test
* Select the db.t2.micro DB instance
* Select No for Multi-AZ Deployment
* Select a unique DB Instance Identifier
* Select a username and password and remember them for the connection
* Click on Next Step
* Make sure Publicly Accessible is set to No
* Use the default VPC security group
* Select a database name - it will be used for the connection
* Click Launch DB Instance
* Additional resources - [Working with RDS in a VPC](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html#USER_VPC.CreateVPCSecurityGroup)

#### Deploy using elastic beanstalk

* Deploying to EB is very easy with the [EB CLI](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
* The docs do an excellent job explaining how to install the EB CLI and configure it for your project
* When running `eb init`, make sure to select the same region that you selected for your elasticache and RDS instances
* When prompted to set up SSH, do so. This will be necessary to deploy the ember app. Unfortunately, ember-cli-deploy-ssh-tunnel does not support password encrypted key-pairs, so leave the password blank!

#### Make sure security group rules are in sync

* I've found that for the resources just created (elasticache, RDS, EC2 (through elasticbeanstalk)), the best way to ensure you don't have trip ups is to make sure they are all on the same security group, configured to accept traffic between them
* If you created a security group in the beginning, and assigned it to your RDS and elasticache clusters, they should already have it
* If not
  * You can change the security group on your RDS instance by visiting the RDS Console > Instances > Click on Instance Actions > Modify
  * You can change the security group on your ElastiCache cluster by visiting the ElstiCache Console > Replication Groups > Click on your Replication Group > Click Modify
* You will need to add your custom security group to your EC2 Instance
  * Go to the EC2 Console > Instances > Select your Instance > Actions > Networking > Change Security Groups. From there make sure your custom group is selected and click Assign Security Groups
* Then, for your custom security group, make sure it has the following rules
  * Go to VPC Console > Security Groups > Select your custom security group > Click on Inbound Rules (at the bottom)
  * Copy that security groups groupId (sg-{something}), and then click Edit in the Inbound rules section
    * First, add a rule for Postgres > Select PostgreSQL from Type, and add your groupID in the source field ([docs](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/GettingStarted.AuthorizeAccess.html)). Click Add another rule
    * Then, add a rule for connecting to Redis > Select Custom TCP Rule from Type, and add your groupID in the source field. Click Add another rule
    * Finally, add a rule to SSH into your VPC to access your EC2 app > Select SSH from Type, and in the source add your own [public IP address](http://checkip.amazonaws.com/) ([docs](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/authorizing-access-to-an-instance.html)). Click Save

#### Test it out

* First, let's SSH into your EC2 instance ([docs](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html))
  * First, find the public IP address for your EC2 instance (Listed under Public IP on the EC2 Instance Dashboard)
  * Open a console, add type the command `ssh -i {path to key (without .pub)} ec2-user@{EC2 public IP}`
  * It should work!
* Once you are in your EC2 instance, connect to your DB
  * run `sudo yum install postgresql-server` to install postgres
  * Find your RDS Endpoint > Go to RDS Console > Instances > Select Instance > Find the Endpoint field > Get the endpoint _without_ the port tacked on the end
  * run `psql -h {Endpoint (Host)} -p {Port (should be 5432)} -U {username} -W {dbname}` ([ref](http://www.postgresql.org/docs/9.5/static/app-psql.html))
  * It should prompt you for your password. After you provide that you should be in! Type `\q` to get out
* Now connect to your Redis ([docs](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/AmazonVPC.Connecting.html))
  * Type `sudo yum install telnet` to install telnet
  * Find your Elasticache Endpoint > Go to Elasticache Console > Replication Groups > Select Group > Scroll down to Primary Endpoint > Get the endpoint _without_ the port tacked on the end (also, see [docs](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/Endpoints.html))
  * In your console within your EC2 instance (SSHed in), type `telnet {Elasticache Endpoint} {Port (should be 6379)}`
  * You can type `KEYS *` to verify it worked, and then `quit` to exit
* Type `exit` to exit from the SSH

### Configure your environment

First, open up your config/environments/production.js file
* Enter in your database host (make sure to strip port of the end), port, username (user), password, and the name of your database
* Enter in your redis host (Endpoint) (strip port) and redisPrefix. The redisPrefix should be `{ember app name}:index:`
* Enter in the mailchimp apiKey, mailingListId, categoryId, registeredUserId, and mailingListId
* Enter in your gmail information for nodemailer
* And fill in the other fields with the desired configuration (jwtSecret and sessionSecret can be any secret string)
Then, in your Ember App, be sure to fill in the necessary information for deployment in config/env-vars.js
* appName should match your ember app name
* accessKeyId is the accessKeyId that is pegged to your IAM user
* secretAccessKey is the secretAccessKEy that is pegged to your IAM user
* s3Bucket is the name of your S3 bucket that you created
* s3Region is the name of the region your s3 is located in
* cdnUrl is the prefix that will be prepended to static assets. One way to find this is to add a file to your s3 bucket, open it, and see the url that is listed before the asset. In general, it follows the form `https://s3-{s3 region}.amazonaws.com/{bucket name}/{app name}/`
* tunnelConfig is used to ssh into the ec2 instance, and connect to redis from there to deploy index.html
  * username should be 'ec2-user'
  * host should be the elasticbeanstalk ec2 instance public IP address
  * privateKeyPath should be the path in your system to your private key to ssh into the ec2 instance
  * dstHost should be the Endpoint for your elasticache redis instance

### Deploy the app!

First, go through the ember README and follow the instructions to install node modules and bower components
* Then, in your ember app directory, just `ember deploy 'prod'` and if all the configuration is set it should just work
  * Follow the instructions in response to activate the revision, `ember deploy:activate prod --revision={revision hash}`
  * You can verify it did by connecting to your Redis instance, typing `KEYS *`, and verifying that the redis key for your revision is there
  * Also check to make sure it dumped static assets in your s3 bucket - it should be there under {app name}
  * Once your app is in s3, right click on it and select make public, so that it can serve it's assets to your application
* Before deploying with elastic beanstalk, first go to your elastic beanstalk app Services (upper left) > Elastic Beanstalk > Configuration (left) > Software Configuration (click the gear) > scroll to the bottom, and under environment properties, type NODE_ENV under Property Name and production under Property Value > and click the + and apply
  * This sets your environment variables to use production
* In your node app directory, type `eb deploy` (make sure you've committed all changes to git first)
  * Once the app is done deploying, it should be working! type `eb open` to open the app

## Note on environment config

For both the Node and Ember apps, there are environment configuration variables that are set within the development.js, test.js, and production.js (and env-vars.js) files. These are obviously sensitive, and should be disseminated with care. Do not commit these to a public repo!

## Disclaimer

I do not claim to be an expert programmer, and I am sure there are many bugs and flaws in this application. As you notice them, please open issues and point them out to me, so that we can keep improving it. Note in particular any security flaws that you see, please make sure we can address them. Thanks!

## Contributing

I would love for you to contribute, suggestions, PR's, everything is welcome to make this an awesome boilerplate app

## License

MIT