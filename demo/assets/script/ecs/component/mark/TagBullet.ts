/**
 * @Author: Gongxh
 * @Date: 2025-05-26
 * @Description: 子弹标记组件
 */

import { ecs } from "../../../header";
import { EntityType } from "../header/EntityType";
const { ecsclass } = ecs._ecsdecorator;

@ecsclass("TagBullet", { describe: "子弹标记组件" })
export class TagBullet extends ecs.Component {
    /** 获取标记掩码 */
    public getMask(): number {
        return 1 << EntityType.Bullet;
    }

    public reset(): void {
    }
}
