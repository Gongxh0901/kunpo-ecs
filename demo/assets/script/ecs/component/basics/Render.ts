/**
 * @Author: Gongxh
 * @Date: 2025-05-19
 * @Description: 渲染组件
 */
import { Node } from "cc";
import { ecs } from "../../../header";
const { ecsclass, ecsprop } = ecs._ecsdecorator;

enum RenderType {
    Sprite = 1,
    Prefab = 2,
}

@ecsclass("Render", { describe: "渲染组件" })
export class Render extends ecs.Component {
    public node: Node = null;

    public reset(): void {
        this.node.destroy();
        this.node = null;
    }
}