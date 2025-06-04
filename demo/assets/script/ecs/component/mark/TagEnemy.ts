/**
 * @Author: Gongxh
 * @Date: 2025-05-26
 * @Description: 
 */
import { ecs } from "../../../header";
import { EntityType } from "../header/EntityType";
const { ecsclass } = ecs._ecsdecorator;

@ecsclass("TagEnemy", { describe: "敌人标记组件" })
export class TagEnemy extends ecs.Component {
    /** 获取标记掩码 */
    public getMask(): number {
        return 1 << EntityType.Enemy;
    }

    public reset(): void {
    }
}
