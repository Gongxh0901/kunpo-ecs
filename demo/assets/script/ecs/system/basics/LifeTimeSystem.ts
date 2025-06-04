/**
 * @Author: Gongxh
 * @Date: 2025-05-16
 * @Description: 
 */
import { ecs } from "../../../header";
import { LifeTime } from "../../component/basics/LifeTime";
const { ecsystem, ecsprop } = ecs._ecsdecorator;

@ecsystem("LifeTimeSystem", { describe: "生命周期系统" })
export class LifeTimeSystem extends ecs.System {
    protected onInit(): void {
        this.matcher.allOf(LifeTime);
    }

    public update(dt: number): void {
        const query = this.query;
        for (const [entity, lifeTime] of query.iterate1(LifeTime)) {
            lifeTime.lifeTime -= dt;
            if (lifeTime.lifeTime <= 0) {
                this.world.removeEntity(entity);
            }
        }
    }
}