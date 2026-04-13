<!-- source: https://www.mongodb.com/docs/manual/core/search-in-community/deploy-rs-keyfile-mongot/ | content-type: text/html; charset=UTF-8 | bytes: 525820 -->

Docs Menu

[Docs Home](https://www.mongodb.com/docs/)

 /   / 

[Community Edition](https://www.mongodb.com/docs/manual/administration/install-community)

[Docs Home](https://www.mongodb.com/docs/)

 / 

[Management](https://www.mongodb.com/docs/management)

 / 

[Installation](https://www.mongodb.com/docs/manual/installation)

 / 

[Community Edition](https://www.mongodb.com/docs/manual/administration/install-community)

[Docs Home](https://www.mongodb.com/docs/)

 / 

[Management](https://www.mongodb.com/docs/management)

 / 

[Installation](https://www.mongodb.com/docs/manual/installation)

 / 

[Community Edition](https://www.mongodb.com/docs/manual/administration/install-community)

This procedure guides you through setting up a `mongod` locally in order to complete the [Install MongoDB Search and MongoDB Vector Search](https://www.mongodb.com/docs/manual/administration/install-community/#std-label-community-search-deploy) Tarball installation tutorial.

## Note

If you already have a replica set with keyfile authentication set up, you can skip this procedure.

1

With [keyfile](https://www.mongodb.com/docs/manual/core/security-internal-authentication/#std-label-internal-auth-keyfile) authentication, each [mongod](https://www.mongodb.com/docs/manual/reference/program/mongod/#mongodb-binary-bin.mongod) instances in the replica set uses the contents of the keyfile as the shared password for authenticating other members in the deployment. Only [mongod](https://www.mongodb.com/docs/manual/reference/program/mongod/#mongodb-binary-bin.mongod) instances with the correct keyfile can join the replica set.

## Note

[Keyfiles for internal membership authentication](https://www.mongodb.com/docs/manual/core/security-internal-authentication/#std-label-internal-auth-keyfile) use YAML format to allow for multiple keys in a keyfile. The YAML format accepts either:

- A single key string (same as in earlier versions)

- A sequence of key strings

The YAML format is compatible with the existing single-key keyfiles that use the text file format.

A key's length must be between 6 and 1024 characters and may only contain characters in the base64 set. All members of the replica set must share at least one common key.

## Note

On UNIX systems, the keyfile must not have group or world permissions. On Windows systems, keyfile permissions are not checked.

You can generate a keyfile using any method you choose. For example, the following operation uses `openssl` to generate a complex pseudo-random 1024 character string to use as a shared password. It then uses `chmod` to change file permissions to provide read permissions for the file owner only:

``` leafygreen-ui-11itue3

openssl rand -base64 756 > 
```

chmod 400 \

See [Keyfiles](https://www.mongodb.com/docs/manual/core/security-internal-authentication/#std-label-internal-auth-keyfile) for additional details and requirements for using keyfiles.

2

Copy the keyfile to each server hosting the replica set members. Ensure that the user running the `mongod` instances is the owner of the file and can access the keyfile.

Avoid storing the keyfile on storage mediums that can be easily disconnected from the hardware that hosts the `mongod` instances, such as a USB drive or a network attached storage device.

3

To create your configuration file, save the following code to `mongod.conf` or your preferred location.

``` leafygreen-ui-11itue3
```

net:

port: 27017

bindIpAll: true

replication:

replSetName: rs0

setParameter:

mongotHost: localhost:27027

searchIndexManagementHostAndPort: localhost:27027

processManagement:

fork: true

systemLog:

destination: file

path: /var/log/mongodb/mongod.log

logAppend: true

4

To start the `mongod`, run the following command, specifying the configuration file you created above:

``` leafygreen-ui-1q4bxgx
./mongod --config mongod.conf
```

5

Use `mongosh` to connect to the primary node with this command:

``` leafygreen-ui-1q4bxgx
mongosh --port 27017
```

6

Use the [rs.initiate()](https://www.mongodb.com/docs/manual/reference/method/rs.initiate/#mongodb-method-rs.initiate) method to initiate your replica set. For details, see [this example .](https://www.mongodb.com/docs/manual/reference/method/rs.initiate/#std-label-rs-initiate-example)

7

To create an admin user on your `mongod`, run the following commands, replacing `` with the desired password for the `myAdmin` user:

``` leafygreen-ui-11itue3
use admin
```

db.createUser(

{

user: "myAdmin",

pwd: "\",

roles: \[

{

role: "root",

db: "admin"

}

\]

}

)

For details, see [Create a User-Defined Role .](https://www.mongodb.com/docs/manual/tutorial/manage-users-and-roles/#std-label-create-user-defined-role)

8

To exit `mongosh`, run:

``` leafygreen-ui-1q4bxgx
exit
```

9

Uncomment the following lines in the `mongod.conf` file you created in [Create your mongod configuration file](https://www.mongodb.com/docs/manual/core/search-in-community/deploy-rs-keyfile-mongot/#std-label-create-mongod-config). Replace `` with the path to the keyfile you created in [Create your keyfile .](https://www.mongodb.com/docs/manual/core/search-in-community/deploy-rs-keyfile-mongot/#std-label-create-your-keyfile)

``` leafygreen-ui-11itue3
security:
```

authorization: enabled

keyFile: \

10

To start `mongod` with keyfile authentication, specify the config file that you created in [Create your mongod configuration file](https://www.mongodb.com/docs/manual/core/search-in-community/deploy-rs-keyfile-mongot/#std-label-create-your-keyfile) and updated throughout the procedure.

``` leafygreen-ui-1q4bxgx
.
/mongod
 --config mongod.conf
```

- [Install MongoDB Search and MongoDB Vector Search](https://www.mongodb.com/docs/manual/administration/install-community/#std-label-community-search-deploy)

Back

Connect to Search

Next

Enterprise

Rate this page
