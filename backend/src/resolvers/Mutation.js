const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require('crypto');
const {promisify} = require('util');
const { transport, makeANiceEmail } = require('../mail')


const Mutations = {
  async createItem(parent, args, ctx, info) {
    if(!ctx.request.userId){
      throw new Error('You must be logged on to do that');
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          //this is how to create relationship between the Item and the users
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    console.log(item);

    return item;
  },
  updateItem(parent, args, ctx, info) {
    //first take a copy of the updates
    const updates = { ...args };
    //remove the ID from the updates
    delete updates.id;
    //run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the Item
    const item = await ctx.db.query.item({ where }, `{id title}`);
    // 2. Check if they own this Item, or have the permissions.
    // TODO
    // 3. Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  //////////////////SignUP////////////////////////

  async signup(parent, args, ctx, info) {
    // to lower case
    args.email = args.email.toLowerCase();
    //hash their password
    const password = await bcrypt.hash(args.password, 10);
    //create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    //create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //we set the jwt as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // This is one year
    });
    //Finally  we return the user to the browser
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // 1. Check if there is a user with that email
    // { where: { email } } = (email = email)
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found with this ${email}`);
    }
    // 2. check if there password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password!");
    }
    // 3 Generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the to cookie with a token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // This is one year
    });
    // 5 Return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
     return { message: "Goodbye!" };
  },
  async requestReset(parent, args, ctx, info) {
    //1. Check if this is real user
    const user = await ctx.db.query.user({ where:{ email: args.email  }});
    if(!user) {
      throw new Error(`No such user found with this ${args.email}`)
    }
    //2. Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // This is 1 hour
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email},
      data: { resetToken, resetTokenExpiry }
    });

    //3. Email them a reset token
    const mailRes = await transport.sendMail({
    from: 'stephmen@gmail.com',
    to: user.email,
    subject: 'Your Password Reset Token',
    html: makeANiceEmail(`Your Password Token is Here!
    \n\n
    <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Clik Here to Reset</a>`)
    })


    //4. Return the message
        return {message: "Thanks!"};
  },

///////////////////Reset Password ///////////////////

  async resetPassword(parent, args, ctx, info){
    //1. check if the password match
    if(args.password !== args.confirmPassword) {
      throw new Error("Your Passwords dont match!")
    }
    //2.check if this is a legit resset tokem
    //3. check if the token is expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 36000000
    }
  })
  if(!user) {
    throw new Error('This token is either invalid or expired')
  }
    //4. hash their new password
    const password = await bcrypt.hash(args.password, 10);
    //5. save the new passoword to the user and remove old reset token
    const updatedUser = await ctx.db.mutation.updateUser({
       where: { email: user.email },
       data: {
         password,
         resetToken: null,
         resetTokenExpiry: null,
       },
    })
    //6 generte JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET )
    //7. set the JWt cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    //8. return the new user
    return updatedUser
  },
};

module.exports = Mutations;
