import { MessageType } from "../components/enums/level.enum";

export class Message {
    constructor(
        public message: string,
        public type: MessageType
    ) { }
}