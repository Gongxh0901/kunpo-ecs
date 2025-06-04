/**
 * @Author: Gongxh
 * @Date: 2025-05-19
 * @Description: 
 */
import { Prefab as ccPrefab, SpriteFrame as ccSpriteFrame, instantiate, Node, Sprite } from "cc";
import { ecs, KunpoAssets } from "../../../header";
import { WorldHelper } from "../../../WorldHelper";
import { Position } from "../../component/basics/Position";
import { Render } from "../../component/basics/Render";
import { Prefab, SpriteFrame } from "../../component/configure/Asset";
// import { Prefab, SpriteFrame } from "../../component/configure/Asset";
const { ecsystem, ecsprop } = ecs._ecsdecorator;

@ecsystem("RenderGenerate", { describe: "初始化渲染系统" })
export class RenderGenerate extends ecs.System {
    protected onInit(): void {
        this.matcher.allOf(Position).anyOf(Prefab, SpriteFrame).excludeOf(Render);
    }

    public update(dt: number): void {
        const query = this.query;

        for (const [entity, position, prefab, spriteFrame] of query.iterate3(Position, Prefab, SpriteFrame)) {
            if (prefab) {
                let asset = KunpoAssets.AssetPool.getByUUID<ccPrefab>(prefab.uuid);
                const node = instantiate(asset);
                node.setPosition(position.x, position.y);
                WorldHelper.node.addChild(node);
                node.layer = 1 << 1;

                let render = this.world.addComponent(entity, Render);
                render.node = node;

                // 删除组件
                this.world.removeComponent(entity, Prefab);
            } else if (spriteFrame) {
                let node = new Node(`${entity}`);
                let sprite = node.addComponent(Sprite);
                sprite.spriteFrame = KunpoAssets.AssetPool.getByUUID<ccSpriteFrame>(spriteFrame.uuid);
                node.setPosition(position.x, position.y);
                WorldHelper.node.addChild(node);
                node.layer = 1 << 1;

                let render = this.world.addComponent(entity, Render);
                render.node = node;

                this.world.removeComponent(entity, SpriteFrame);
            }
        }
    }
}