/**
 * @Author: Gongxh
 * @Date: 2025-05-13
 * @Description: 实体掩码
 */

export class Mask {
    /** 32位二进制数组 由于&操作符最大只能30位操作 故每个三十二位二进制保存30个组件 */
    private mask: Uint32Array;
    private size: number = 0;

    constructor() {
        // 计算32位掩码数量  (总组件数/31)
        //TODO::这里是组件总数
        let length = Math.ceil(72 / 31);
        this.mask = new Uint32Array(length);
        this.size = length;
    }

    /**
     * 设置掩码
     * @param num
     */
    public set(num: number): Mask {
        /// >>> 无符号位移 高位补0
        this.mask[(num / 31) >>> 0] |= 1 << num % 31;
        return this;
    }

    /**
     * 移除掩码
     * @param num
     */
    public delete(num: number): Mask {
        this.mask[(num / 31) >>> 0] &= ~(1 << num % 31);
        return this;
    }

    /**
     * 查找是否存在
     * @param num
     * @returns
     */
    public has(num: number): boolean {
        // !!取布尔值 0或1
        return !!(this.mask[(num / 31) >>> 0] & (1 << num % 31));
    }

    /**
     * 检查两个掩码是否有交集
     * @param other 
     * @returns 
     */
    public any(other: Mask): boolean {
        for (let i = 0; i < this.size; i++) {
            if (this.mask[i] & other.mask[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * this是否包含other
     * @param other 
     * @returns 
     */
    public include(other: Mask): boolean {
        for (let i = 0; i < this.size; i++) {
            if ((this.mask[i] & other.mask[i]) != other.mask[i]) {
                return false;
            }
        }
        return true;
    }

    public clear(): Mask {
        for (let i = 0; i < this.size; i++) {
            this.mask[i] = 0;
        }
        return this;
    }
}