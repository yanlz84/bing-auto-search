// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.247
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
var default_search_words = ["习近平冀望美丽西藏新篇章", "被错误羁押6千天男子申请国赔1911万", "内蒙古自治区政府主席王莉霞被查", "我们能直接从阅兵场走向战场", "高一女生军训第4天倒地后死亡", "人民日报三问尖扎黄河特大桥事故", "“三只羊”“东北雨姐”被点名", "女子悬赏上海一套房寻子：6代单传", "中方回应“乌称不需中国提供安保”", "知名超市半年关了227家店", "男子打胰岛素1月后发现针套没摘", "广州在住宅区喷剧毒农药？谣言", "大桥施工绳索断裂事故致12死4失联", "外交部：中方欢迎李在明总统特使访华", "新疆一河水退去留520米巨鲸图案", "大衣哥不齐女团燃跳贵州", "74岁李龙基曝与38岁未婚妻生子计划", "17岁少年因欠债未还被好友殴打致死", "湖南2岁多女童家门口玩耍时失踪", "当地回应民警上门找曝光者谈话", "妻子自行堕胎 丈夫索赔被驳回", "女子没拉窗帘裸睡被擦玻璃工人看到", "青海省长赶赴大桥事故现场指挥救援", "黄渤担心遗传父母的阿尔兹海默症", "英伟达暂停H20芯片生产 外交部回应", "孙颖莎4-1伊藤美诚晋级四强", "许凯家暴事件女主：我的天要亮了吗", "柠檬泡水真能补维C吗", "于正：我被资本做局了", "福建一煤矿井下作业7人死亡", "许凯被打雷吓失眠", "A股收盘 沪指涨1.45%站上3800点", "中国渔民多次捞到“间谍鱼”", "女子称逃离家暴时被泼硫酸严重毁容", "曝光乡政府人员缺岗当事人发声", "杭州银行支行要求员工周末无偿加班", "因主人欠款狸花猫遭法拍 拍卖被撤销", "许凯称已报警并委托律师起诉", "2人为争夺758万大奖所有权闹上法庭", "许荔莎报警", "官方通报女子被求子父母虐待致残", "费大爷费大师被误认费大厨", "江苏一医院开设“浑身不得劲门诊”", "女子用激光脱毛仪误伤眼睛视力骤降", "胡夏称目前单身 曾与金晨传绯闻", "北方潮湿持续 市民开电热毯烘床", "泰国刑事法院驳回对他信的起诉", "锦州烧烤万物皆可烤", "别把开学抑郁当矫情", "市监总局：开办餐饮店时间减至15天", "普通花露水没驱蚊效果"]

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
