const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
      me: async (parent, args, context) => {
          if(context.user) {
              const userData = await User.findOne({})
              .populate('books')            
              return userData;
          }
          throw new AuthenticationError('Please log in');
      },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
 
      login: async (parent, {email, password}) => {
          const user = await User.findOne({email});
          if(!user) {
              throw new AuthenticationError('User not found with this email or password');
          }
          const correctPw = await user.isCorrectPassword(password);
          if(!correctPw) {
              throw new AuthenticationError('User not found with this email or password');
          }
          const token = signToken(user);

          return {token, user};    
      },
     
      saveBook: async (parent, { bookData }, context) => {
          if (context.user) {
              const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: bookData } },
                { new: true }
              );
              return updatedUser;
            }     
          throw new AuthenticationError('Please log in');
      },
   
      removeBook: async (parent, args, context) => {
          if(context.user) {
          const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId: args.bookId } } },
              { new: true }
          );
          return updatedUser;
          }
          throw new AuthenticationError('Please log in');
      }
  }
};

module.exports = resolvers;
