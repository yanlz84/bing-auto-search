// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.348
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["树立全球妇女事业发展新的里程碑", "“人生的意义”小吃店爆红后歇业", "美国炸药厂爆炸事件尚未发现幸存者", "“中国建造”享誉海外！", "故宫地下有一条15公里暗沟", "101岁院士被蹭合影 合影当事人回应", "11名“班主任”落网", "“纹面男孩”已拿到新身份证", "充电器一直不拔有多可怕", "研究：南极海底甲烷渗出速度惊人", "张靓颖回应摔下舞台：我没事！", "四川达州大竹县发生洪灾系谣言", "浙江一居民楼出现空心菜“瀑布”", "下肢瘫痪投河男子死前曾给妹妹转账", "金正恩连续八次深夜阅兵", "男子赴老板老家饮酒后坠亡 法院判了", "曝广东海洋大学“宿舍像废弃仓库”", "新人婚礼双方父母在台上嗨跳", "“美女博主”诱导策反100余人窃密", "停火生效后 超50万民众返回加沙城", "中央气象台暴雨蓝色预警持续", "胡雷回应捐赠物资被收高速费", "谷歌前CEO警告：AI可能学会杀人", "摊主女儿大口吃父母摊位剩食走红", "蓝战非各平台账号已解封", "国防科技大学学员宣誓热血沸腾", "山航空姐全面换穿平底鞋", "西安补水喷雾式下雨 高校秒变仙宫", "iPhone 17系列激活量曝光", "日本在野党协商联手让高市早苗落选", "张靓颖演唱会摔下两米高舞台", "南部战区空军某部进行实弹战术演练", "贵州花江峡谷大桥观光电梯暂停运行", "下周起南北方气温都有大变化", "未来战场看“鸟群”出击", "郑丽文谈两岸和平：别让外界见缝插针", "影后黛安基顿去世 曾主演《教父》", "深圳水贝三家黄金珠宝公司被查处", "全国多地中小学探索春秋假制度", "男子发现东北抗联用过的缝纫机残件", "美一夜发生两起校园枪击案致6死多伤", "印度大学生被警察殴打致死", "郭斌任鞍钢集团总经理", "苹果官网出现“错别字”", "广西仍有9条河流13个站超警", "伊朗与巴基斯坦外长通电话", "鹤洞大桥灯光“绿”到发慌？回应来了", "中方回应美财政部长贝森特错误言论", "四川阿坝州茂县发生3.1级地震", "乌克兰总统与加拿大总理通电话", "寿宴上遭恶意纠缠摆拍 百岁院士维权"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
