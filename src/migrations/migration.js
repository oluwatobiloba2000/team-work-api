/* eslint-disable no-console */
// DROP TABLE IF EXISTS users;
const createUserTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS
    users(
        id UUID PRIMARY KEY NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
        username VARCHAR UNIQUE NOT NULL,
        profile_img VARCHAR NULL,
        header_img VARCHAR NULL,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        firstname VARCHAR NOT NULL,
        lastname VARCHAR NOT NULL,
        createdat TIMESTAMP DEFAULT NOW()
    )
`;

const createOrganizationTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS
    organization(
        id UUID PRIMARY KEY NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        header_img VARCHAR NULL,
        isPrivate BOOLEAN DEFAULT true,
        createdat TIMESTAMP DEFAULT NOW()
    )
`;

const createOrganizationMembersTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS
    organizationMembers(
        id UUID PRIMARY KEY NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        invite_key VARCHAR NULL,
        email VARCHAR UNIQUE NOT NULL,
        organization_id UUID NOT NULL,
        isAdmin BOOLEAN DEFAULT false,
        createdat TIMESTAMP DEFAULT NOW()
        FOREIGN KEY (user_id) REFERENCES "users" (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES "organization" (id) ON DELETE CASCADE
  )
`;

// DROP TABLE IF EXISTS diary;
const createPostTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS
    post(
        id UUID PRIMARY KEY NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
        article VARCHAR NULL,
        gif VARCHAR NULL,
        user_id UUID NOT NULL,
        origanization_id UUID NOT NULL,
        editedat TIMESTAMP NULL,
        privacy VARCHAR NOT NULL,
        isedited BOOLEAN DEFAULT false,
        createdat TIMESTAMP DEFAULT NOW(),
        is_in_appropriate BOOLEAN DEFAULT false,
        FOREIGN KEY (user_id) REFERENCES "users" (id) ON DELETE CASCADE,
        FOREIGN KEY (origanization_id) REFRENCES "organization" (id) ON DELETE CASCADE
    )
`;

const createCommentTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS
    comment(
        id UUID PRIMARY KEY NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
        comment VARCHAR NULL,
        post_id UUID NOT NULL,
        user_id UUID NOT NULL,
        createdat TIMESTAMP DEFAULT NOW(),
        is_in_appropriate BOOLEAN DEFAULT false,
        FOREIGN KEY (user_id) REFERENCES "users" (id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFRENCES "post" (id) ON DELETE CASCADE
    )
`;

const migrate = async (db) => {
  try {
    await db.query(createUserTableQuery);
    await db.query(createOrganizationTableQuery);
    await db.query(createOrganizationMembersTableQuery);
    await db.query(createPostTableQuery);
    await db.query(createCommentTableQuery);
    return true;
  } catch (error) {
    return console.log(error);
  }
};

export default migrate;
