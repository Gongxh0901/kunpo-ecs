/**
 * @Author: Gongxh
 * @Date: 2025-05-23
 * @Description: 用来标记实体的类型
 */
import { ecs } from "../../../header";
import { EntityType } from "../header/EntityType";
const { ecsclass } = ecs._ecsdecorator;

@ecsclass("TagHero", { describe: "英雄标记组件" })
export class TagHero extends ecs.Component {
    /** 获取标记掩码 */
    public getMask(): number {
        return 1 << EntityType.Hero;
    }

    public reset(): void {
    }
}
