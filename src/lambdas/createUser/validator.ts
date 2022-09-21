import Joi = require('joi');
import { InputUserData } from './input-user-data';

const InputUserDataJoiSchema = Joi.object<InputUserData>({
    FirstName: Joi.string(),
    LastName: Joi.string()
});

export function validate(input: any) {
    const result = InputUserDataJoiSchema.validate(input);
    if (result.error) {
      return result.error;
    }
    return result.value;
}