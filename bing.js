// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.120
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
var default_search_words = ["习近平同俄罗斯总统普京通电话", "王皓考编总成绩第一", "伊朗首都德黑兰传出巨大爆炸声", "中国这些举措在世贸组织获赞", "泰国总理就通话录音泄露道歉", "伊朗：挫败以方针对伊外长的暗杀行动", "网警打击“重庆大火系人为”造谣者", "特朗普将在两周内决定是否攻击伊朗", "王欣瑜回应淘汰高芙", "63岁中国农大校长全程站立拨穗14小时", "特朗普驳斥美打击伊朗计划已获批", "两干部买泡面被通报批评？政府回应", "SpaceX回应星舰爆炸", "以总理：有能力摧毁伊朗所有核设施", "特朗普称美国假期太多：要伟大少放假", "王欣瑜2-0淘汰高芙", "俄方警告美国不要军事干预以伊冲突", "世俱杯：迈阿密2-1逆转波尔图", "宜宾19岁女大学生已失联近5天", "NBA总决赛：雷霆vs步行者", "伊朗任命情报部门新负责人", "大连天空现“窟窿云”", "男厕改女厕遭质疑？商场回应", "以军称伊朗向以色列发射超20枚导弹", "伊朗“泥石”弹道导弹有何特别之处", "伊称打击以反导防御系统等军事目标", "周杰伦患强直性脊柱炎 近照弯腰驼背", "已有1600余名中国公民从伊朗撤离", "伊朗国家电视台被炸后一片焦黑", "刘强东点外卖 给骑手1000元小费", "吴梦洁：为我们这个团队感到骄傲", "小沈阳女儿NINA出道韩国初舞台", "以总理：与美国设定了两个共同目标", "上百名在以中国公民撤离至埃及境内", "世联赛积分榜：中国女排升至第五", "全球首款低空无人机感知基站亮相", "世界女排联赛中国3-2保加利亚", "伊“真实承诺-3”第15阶段行动启动", "苏宁易购拟4元出售4家家乐福子公司", "梅西世俱杯进6球和贝尔本泽马持平", "伊朗向以发动48小时内最大规模袭击", "园方回应游客用手拽孔雀尾巴", "伊朗警告美国：所有选项都在考虑范围", "湖南一小区车库被淹 4名业主失联", "中方回应“美或对伊朗发动袭击”", "以色列一工人被坠落广告牌砸伤", "揭秘以色列情报网络如何运作", "中国成功研发蚊子大小仿生机器人", "金价跌跌不休", "WTT球星赛：张本智和遭遇首败", "小学生手机识别出路边大麻及时报警"]

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
