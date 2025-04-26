// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.10
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
var default_search_words = ["为实现中国梦强军梦汇聚强大力量", "日本东京有8.3级大地震？专家回应", "中方拆穿美假消息 CNN直播吵起来了", "美国关税“后坐力”显现", "谢霆锋演唱会唱定情曲 王菲陶醉起舞", "女子手机失控冲进派出所民警让砸掉", "韩“国家学者”1号人物 赴中国任职", "女子月入5万北漂十几年只攒下十万", "巴基斯坦最近“比较烦”", "重磅会议定调 A股下步怎么走", "纽约市民凌晨排队抢购中国全景相机", "上海五一将冲40℃？假", "孩子拍打爷爷被一把推下座椅", "郑钦文止步马德里站女单次轮", "人社部：退休后不能转移养老保险关系", "湖北小孩请AI人脉给哥哥报志愿", "中央巡视组进驻 女厅官主动交代问题", "特朗普政府将恢复外国学生合法身份", "俄军高官在汽车爆炸中身亡", "枪击事件后第三天 印巴直接交火了", "刘雨欣疑回应曾被张檬插足婚姻", "阿维塔高管称车辆控制比速度重要", "特朗普政府内部陷入“大乱斗”", "特朗普：俄乌“非常接近”达成协议", "儿子悄悄考上北大妈妈惊成静止画面", "沪深北交易所修订发布股票上市规则", "普京与特朗普特使闭门会谈3小时", "航行警告 黄海南部进行实弹射击", "胖东来4个月销售额超75亿元", "跳楼机原唱回应被调侃“老头味”", "步行者vs雄鹿", "曝插足他人婚姻女星整容失败", "俄方证实普京会见美特使", "任嘉伦说“再见了半夏”", "63岁徐锦江已向儿子交代后事", "A股市场增持回购热情升温", "特朗普政府打击“生育旅游”", "特朗普又和泽连斯基“大吵一回”", "俄称击落乌无人机 乌摧毁俄武器装备", "格鲁吉亚执政党主席宣布辞职", "皇马正考虑拒绝参加国王杯决赛", "张柏芝最新封面大片曝光", "四家重量级机构在深圳揭牌", "2024年逾43万人获欧盟庇护", "俄未收到德就“北溪”事件调查结果", "杰伦·威廉姆斯系列赛表现全面", "曝曼城将向罗德里提供长期新合同", "37岁DR创始人身家超80亿元", "杨紫给主持人打伞", "新希望：2024年归母净利润4.74亿元", "印巴交火：从“断水”到“反制”"]

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
