// console.log('Hello TypeScript!');

import { Component } from "./Component";
import { _ecsdecorator } from "./ECSDecorator";
import { ComponentType } from "./interface/ComponentType";

// function getBit(value: number) {
//     return 1 << (value % 31);
// }

// let a: number = 1;
// let b: number = 2;
// let c: number = 3;
// let d: number = 4;
// let e: number = 5;
// let f: number = 6;
// let g: number = 7;
// let h: number = 8;
// let i: number = 9;
// let j: number = 10;
// let k: number = 11;
// let l: number = 12;
// let m: number = 13;
// let n: number = 14;
// let o: number = 15;
// let p: number = 16;
// let q: number = 17;
// let r: number = 18;
// let s: number = 19;
// let t: number = 20;
// let u: number = 21;
// let v: number = 22;
// let w: number = 23;
// let x: number = 24;
// let y: number = 25;
// let z: number = 26;
// let aa: number = 27;
// let bb: number = 28;
// let cc: number = 29;
// let dd: number = 30;
// let ee: number = 31;
// let ff: number = 32;
// let gg: number = 33;
// let hh: number = 34;
// let ii: number = 35;
// let jj: number = 36;
// let kk: number = 37;


// console.log(getBit(a).toString(2));
// console.log(getBit(b).toString(2));
// console.log(getBit(c).toString(2));
// console.log(getBit(d).toString(2));
// console.log(getBit(e).toString(2));
// console.log(getBit(f).toString(2));
// console.log(getBit(g).toString(2));
// console.log(getBit(h).toString(2));
// console.log(getBit(i).toString(2));
// console.log(getBit(j).toString(2));
// console.log(getBit(k).toString(2));
// console.log(getBit(l).toString(2));
// console.log(getBit(m).toString(2));
// console.log(getBit(n).toString(2));
// console.log(getBit(o).toString(2));
// console.log(getBit(p).toString(2));
// console.log(getBit(q).toString(2));
// console.log(getBit(r).toString(2));
// console.log(getBit(s).toString(2));
// console.log(getBit(t).toString(2));
// console.log(getBit(u).toString(2));
// console.log(getBit(v).toString(2));
// console.log(getBit(w).toString(2));
// console.log(getBit(x).toString(2));
// console.log(getBit(y).toString(2));
// console.log(getBit(z).toString(2));
// console.log('>>>>>>');

// console.log(getBit(aa).toString(2));
// console.log(getBit(bb).toString(2));
// console.log(getBit(cc).toString(2));
// console.log(getBit(dd).toString(2));
// console.log(getBit(ee).toString(2));

// console.log((getBit(a) | getBit(b)).toString(2));

// // console.log((1 << (ff % 31)).toString(2));
// // console.log((1 << (gg % 31)).toString(2));
// // console.log((1 << (hh % 31)).toString(2));
// // console.log((1 << (ii % 31)).toString(2));
// // console.log((1 << (jj % 31)).toString(2));
// // console.log((1 << (kk % 31)).toString(2));

// import { SparseSet } from './SparseSet';
// import { IComponent } from './interface/IComponent';

// // 定义示例组件类型
// interface Position extends IComponent {
//     x: number;
//     y: number;
//     reset(): void;
// }

// interface Velocity extends IComponent {
//     dx: number;
//     dy: number;
//     reset(): void;
// }

// // 创建组件池
// const positions = new SparseSet<Position>();
// const velocities = new SparseSet<Velocity>();

// // 创建几个实体
// const entity1 = 1;
// const entity2 = 2;
// const entity3 = 3;

// // 添加组件到实体
// positions.add(entity1, { x: 10, y: 20, reset: () => { } });
// positions.add(entity2, { x: 30, y: 40, reset: () => { } });
// positions.add(entity3, { x: 50, y: 60, reset: () => { } });

// velocities.add(entity1, { dx: 1, dy: 2, reset: () => { } });
// velocities.add(entity3, { dx: 5, dy: 6, reset: () => { } });

// // 输出初始状态
// console.log("--- 初始状态 ---");
// console.log("实体1位置:", positions.get(entity1));
// console.log("实体2位置:", positions.get(entity2));
// console.log("实体3位置:", positions.get(entity3));
// console.log("实体1速度:", velocities.get(entity1));
// console.log("实体2速度:", velocities.get(entity2)); // undefined，因为实体2没有速度组件
// console.log("实体3速度:", velocities.get(entity3));

// // 使用forEach遍历所有位置组件
// console.log("\n--- 遍历所有位置组件 ---");
// positions.forEach((position, entityId) => {
//     console.log(`实体${entityId}位置: (${position.x}, ${position.y})`);
// });

// // 模拟移动系统：更新所有同时拥有Position和Velocity组件的实体
// console.log("\n--- 执行移动系统 ---");
// positions.forEach((position, entityId) => {
//     // 检查实体是否也有速度组件
//     if (velocities.has(entityId)) {
//         const velocity = velocities.get(entityId)!;
//         position.x += velocity.dx;
//         position.y += velocity.dy;
//         console.log(`更新实体${entityId}位置到: (${position.x}, ${position.y})`);
//     }
// });

// // 删除组件
// console.log("\n--- 删除实体2的位置组件 ---");
// positions.remove(entity2);
// console.log("实体2位置:", positions.get(entity2)); // undefined

// // 检查组件是否存在
// console.log("\n--- 检查组件存在 ---");
// console.log("实体1有位置组件?", positions.has(entity1)); // true
// console.log("实体2有位置组件?", positions.has(entity2)); // false
// console.log("实体1有速度组件?", velocities.has(entity1)); // true
// console.log("实体2有速度组件?", velocities.has(entity2)); // false

// // 使用迭代器遍历
// console.log("\n--- 使用for...of遍历位置组件 ---");
// for (const [entityId, position] of positions) {
//     console.log(`实体${entityId}位置: (${position.x}, ${position.y})`);
// }

// // 获取组件数量
// console.log("\n--- 组件统计 ---");
// console.log("位置组件数量:", positions.size);
// console.log("速度组件数量:", velocities.size);

// // 清空所有组件
// console.log("\n--- 清空所有组件 ---");
// positions.clear();
// velocities.clear();
// console.log("位置组件数量:", positions.size);
// console.log("速度组件数量:", velocities.size);


_ecsdecorator.ECSComponent("Position", { describe: "位置组件" });
class Position extends Component {
    @_ecsdecorator.ECSProp({ type: "int", defaultValue: 0 })
    x: number = 0;
    @_ecsdecorator.ECSProp({ type: "int", defaultValue: 0 })
    y: number = 0;

    // static componentType: number = 1;
    // static componentName: string = "Position";

    reset(): void {
        this.x = 0;
        this.y = 0;
    }
}

function test<T extends Component>(component: ComponentType<T>) {
    console.log(component.componentType);
    console.log(component.componentName);
}

let position = new Position();

test(Position);
