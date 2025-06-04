/**
 * @Author: Gongxh
 * @Date: 2025-05-26
 * @Description: 
 */

import { ecs, KunpoQuadtree } from "../../../header";
import { WorldHelper } from "../../../WorldHelper";
import { Position } from "../../component/basics/Position";
import { QTShape } from "../../component/basics/QTShape";
import { Scale } from "../../component/basics/Scale";
import { ShapeBox, ShapeCircle } from "../../component/configure/Shape";
import { QuadTree } from "../../component/singleton/QuadTree";
const { ecsystem, ecsprop } = ecs._ecsdecorator;

@ecsystem("ShapeGenerate", { describe: "初始化形状系统" })
export class ShapeGenerate extends ecs.System {
    protected onInit(): void {
        this.matcher.allOf(Position).anyOf(ShapeCircle, ShapeBox).excludeOf(QTShape).optionalOf(Scale);
    }

    public update(dt: number): void {
        const query = this.query;
        // 创建形状 并插入到tree中
        let tree = WorldHelper.getSingleton(QuadTree);
        if (!tree) {
            return;
        }
        for (const [entity, position, circle, box, scale] of query.iterate4(Position, ShapeCircle, ShapeBox, Scale)) {
            if (circle) {
                let shape = new KunpoQuadtree.Circle(circle.radius, 1 << circle.tag);
                shape.setScale(scale ? scale.scale : 1);
                shape.setPosition(position.x, position.y);

                let qtShape = this.world.addComponent(entity, QTShape);
                qtShape.shape = shape;
                qtShape.x = circle.offsetX;
                qtShape.y = circle.offsetY;

                tree.quadTree.insert(shape);

                // 删除组件
                this.world.removeComponent(entity, ShapeCircle);
            } else if (box) {
                let shape = new KunpoQuadtree.Box(box.x, box.y, box.width, box.height, 1 << box.tag);
                shape.setScale(scale ? scale.scale : 1);
                shape.setPosition(position.x, position.y);

                let qtShape = this.world.addComponent(entity, QTShape);
                qtShape.shape = shape;
                qtShape.x = box.offsetX;
                qtShape.y = box.offsetY;

                tree.quadTree.insert(shape);

                // 删除组件
                this.world.removeComponent(entity, ShapeBox);
            }
        }
    }
}