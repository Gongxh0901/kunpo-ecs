/**
 * @Author: Gongxh
 * @Date: 2025-05-16
 * @Description: 
 */
import { ecs } from "../../../header";
import { Direction } from "../../component/basics/Direction";
import { Position } from "../../component/basics/Position";
import { Speed } from "../../component/basics/Speed";
const { ecsystem, ecsprop } = ecs._ecsdecorator;

@ecsystem("MoveSystem", { describe: "移动系统" })
export class MoveSystem extends ecs.System {
    protected onInit(): void {
        this.matcher.allOf(Position, Speed, Direction);
    }

    public update(dt: number): void {
        const query = this.query;
        for (const [entity, position, speed, direction] of query.iterate3(Position, Speed, Direction)) {
            position.x += direction.x * speed.speed * dt;
            position.y += direction.y * speed.speed * dt;
        }
    }
}