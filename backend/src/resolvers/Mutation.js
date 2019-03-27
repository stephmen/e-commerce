const Mutations = {
  createDog(parent, args, ctx, info) {
    global.dogs = global.dogs || [];
  console.log(args)
  }
};
module.exports = Mutations;
