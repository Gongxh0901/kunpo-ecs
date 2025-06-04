/**
 * @Author: Gongxh
 * @Date: 2025-05-26
 * @Description: 反弹系统
 */

import { screen, view } from "cc";
import { ecs } from "../../../header";
import { Direction } from "../../component/basics/Direction";
import { Position } from "../../component/basics/Position";
import { QTShape } from "../../component/basics/QTShape";
import { Speed } from "../../component/basics/Speed";
import { Rebound } from "../../component/mark/Rebound";
const { ecsystem, ecsprop } = ecs._ecsdecorator;

@ecsystem("ReboundSystem", { describe: "反弹系统" })
export class ReboundSystem extends ecs.System {
    protected onInit(): void {
        this.matcher.allOf(Position, Rebound, Speed, Direction, QTShape);
    }

    public update(dt: number): void {
        const query = this.query;

        let halfWidth = screen.windowSize.width / view.getScaleX() * 0.5;
        let halfHeight = screen.windowSize.height / view.getScaleY() * 0.5;

        for (const [entity, position, direction, qtshape] of query.iterate3(Position, Direction, QTShape)) {
            let rect = qtshape.shape.getBoundingBox();
            // kunpo.log("x", rect.x + position.x, "min", -halfWidth - qtshape.x, "max", halfWidth - qtshape.x);
            // kunpo.log("y", rect.y + position.y, "min", -halfHeight - qtshape.y, "max", halfHeight - qtshape.y);
            if (rect.x + position.x < -halfWidth - qtshape.x) {
                direction.x = -direction.x;
                position.x = -halfWidth - qtshape.x + rect.width * 0.5;
            } else if (rect.x + rect.width + position.x > halfWidth - qtshape.x) {
                direction.x = -direction.x;
                position.x = halfWidth - qtshape.x - rect.width * 0.5;
            }

            if (rect.y + position.y < -halfHeight - qtshape.y) {
                direction.y = -direction.y;
                position.y = -halfHeight - qtshape.y + rect.height * 0.5;
            } else if (rect.y + rect.height + position.y > halfHeight - qtshape.y) {
                direction.y = -direction.y;
                position.y = halfHeight - qtshape.y - rect.height * 0.5;
            }
        }
    }
}