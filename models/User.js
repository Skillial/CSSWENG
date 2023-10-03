const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const { hashPassword } = require('../lib/hashing');

const NameSchema = new mongoose.Schema({
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
});

const Name = mongoose.model('Name', NameSchema);

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    authority: {type: String, enum:['Admin', 'SEDO', 'Treasurer'], default: 'Treasurer', required: true},

    photo: {type: String},


    name: { type: NameSchema, required: true },
    contatNum: String,
    validPart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'part' }] 
}, 
    {versionKey: false}
)

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    } catch (error) {
      return next(error);
    }
  });
  
  UserSchema.pre('findOneAndUpdate', async function (next) {
    if (!this._update.password) return next();
  
    try {
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      const hash = await bcrypt.hash(this._update.password, salt);
      this._update.password = hash;
      next();
    } catch (error) {
      return next(error);
    }
  });
  
  UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  };

const User = mongoose.model('user', UserSchema)
module.exports = User


