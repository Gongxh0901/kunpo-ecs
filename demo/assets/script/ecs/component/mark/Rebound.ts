/**
 * @Author: Gongxh
 * @Date: 2025-05-26
 * @Description: 反弹标记组件 遇到边框反弹
 */

import { ecs } from "../../../header";
const { ecsclass } = ecs._ecsdecorator;

@ecsclass("Rebound", { describe: "反弹组件" })
export class Rebound extends ecs.Component {
    public reset(): void {
    }
}