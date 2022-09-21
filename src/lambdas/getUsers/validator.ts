import Joi = require('joi');
import { GetUsersInputData } from './input-data';

const getUsersInputDataJoiSchema = Joi.object<GetUsersInputData>({
  UserId: Joi.string(),
  CreationDate: Joi.string(),
  FirstName: Joi.string(),
  LastName: Joi.string()
});

export function validate(input: any) {
    const result = getUsersInputDataJoiSchema.validate(input);
    if (result.error) {
      return result.error;
    }
    return result.value;
}