import { model, key } from '../../data/MongoModelDecorators';
import { MongoModel } from '../../data/MongoModel';

@model('user')
export class User extends MongoModel {
  
  @key()
  id: number;
  
  firstName: string;
  
  lastName: string;
  
  displayName: string;
  
  email: string;
  
  username: string;
  
  password: string;
  
  salt: string;
  
  profileImageURL: string;
  
  settings: any;
  
  provider: string;
  
  providerData: any;
  
  additionalProvidersData: any;
  
  roles: Array<string>;
  
  updated: Date;
  
  suspended: boolean;
  
  deleted: boolean;
  
  /* For reset password */
  resetPasswordToken: string;
  resetPasswordExpires: string;
  
}
