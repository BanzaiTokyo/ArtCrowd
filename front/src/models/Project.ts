import {User} from "./User";
import {Share} from "./Share";
import {Status} from "./Status";
import {ProjectUpdate} from "./ProjectUpdate";

export interface Project {
    artist:
        { username: string,
            avatar?: string };
    can_buy_shares: boolean;
    can_post_update: boolean;
    created_on: string; //        "2023-10-12T08:15:09.681189Z"
    deadline: string; //        "2023-12-12T09:11:13.137000Z"
    description: string;
    id: number
    image: string;
    commission_pct: number;
    updates: ProjectUpdate[];
    last_update?: string; //        "2023-12-12T09:11:13.137000Z"
    max_shares?: number;
    min_shares?: number
    presenter: User;
    royalty_pct: number;
    share_price: number;
    shares_num: number;
    shares_sum: number;
    sorted_shares: Share[]
    status: Status;
    title: string;
}