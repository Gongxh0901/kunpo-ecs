/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 检测当前环境是否支持BigInt 并提供Mask的接口
 */

function isBigIntSupported(): boolean {
    try {
        const a = BigInt(1);
        const b = BigInt(2);
        const c = a | b;
        const d = a & b;
        const e = a << b;
        return true;
    } catch (e) {
        console.log('当前环境不支持BigInt，将使用Uint32Array实现');
        return false;
    }
}

// 保存检测结果
export const BIGINT_SUPPORTED = isBigIntSupported();

/**
 * 掩码基类接口
 */
export interface IMask {
    set(num: number): IMask;
    delete(num: number): IMask;
    has(num: number): boolean;
    any(other: IMask): boolean;
    include(other: IMask): boolean;
    clear(): IMask;
}
