import {User} from "./User";

export interface Share {
    patron: User;
    quantity: number;
    purchased_on: string; //"2023-10-12T08:15:09.681189Z"
}
