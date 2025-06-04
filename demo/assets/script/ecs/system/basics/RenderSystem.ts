/**
 * @Author: Gongxh
 * @Date: 2025-05-19
 * @Description: 
 */
import { ecs } from "../../../header";
import { Position } from "../../component/basics/Position";
import { Render } from "../../component/basics/Render";
import { Scale } from "../../component/basics/Scale";

const { ecsystem, ecsprop } = ecs._ecsdecorator;

@ecsystem("RenderSystem", { describe: "渲染系统" })
export class RenderSystem extends ecs.System {
    protected onInit(): void {
        this.matcher.allOf(Position, Render).optionalOf(Scale);
    }

    public update(dt: number): void {
        const query = this.query;

        for (const [entity, position, render, scale] of query.iterate3(Position, Render, Scale)) {
            render.node.setPosition(Math.floor(position.x), Math.floor(position.y));
            if (scale) {
                render.node.setScale(scale.scale, scale.scale);
            }
        }
    }
}