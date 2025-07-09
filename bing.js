// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.158
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
var default_search_words = ["前事不忘 后事之师", "尖子生沉迷手机高考失常被扫地出门", "美国航母数量将降至10艘", "台风为什么会出现“蛇形走位”", "儿子短线交易亏2千4 父亲拟被罚10万", "妻子去世后丈夫称太痛苦2年没回家", "官方终于出手整治单踏板了", "余承东回应开车睡觉：第一次进局子", "在开空调和开风扇中选择了开玩笑", "芜湖一医保局现6层奢华水晶吊灯", "6月沸点人物榜出炉 肖战断层领先", "通辽一楼盘全部坍塌？官方辟谣", "中国女篮热身赛73比69击败澳大利亚", "男子开车出事故致女友截瘫后失联", "官方回应凤凰传奇成都演唱会取消", "两艘大船失控 海事船力挽狂澜", "“丹娜丝”3次登陆中国 将深入内陆", "女子坐11小时飞机后心跳骤停去世", "美国得州洪灾已致109人死亡", "天舟八号货运飞船已受控再入大气层", "陈幸同回应打对手11比0", "大学女生和男友双双坠亡 警方通报", "民警违停致摩托司机死亡？西安通报", "陈幸同3比1黄怡桦", "马克龙伸手扶妻子下飞机遭无视", "弗鲁米嫩塞0比2切尔西", "张帅组合无缘温网混双决赛", "切尔西时隔3年再进世俱杯决赛", "蒯曼3:1晋级女单16强", "女子连续一周被邻居冒用地址点外卖", "萨巴伦卡逆转晋级温网四强", "特朗普称对普京很不满意", "台风“丹娜丝”在浙江温州沿海登陆", "中央气象台7月9日发布暴雨黄色预警", "杨紫李现还原对方台词", "以方承认军事基地曾遭伊朗导弹袭击", "曝田栩宁滕泽文曾交往", "俄总理：俄无人机产量已三倍于目标", "以军空袭加沙一营地 至少52人死亡", "俄认定耶鲁大学为不受欢迎外国组织", "苹果基础模型团队负责人被Meta挖走", "特朗普：鲍威尔应当立即辞职", "得州长说仍有至少161人在洪灾中失踪", "特朗普：不会赦免农场的非法移民", "得州洪灾死伤惨重灾区市长含泪哭诉", "桥本环奈来上海了", "翁虹回应女儿是否出道", "滕泽文被于正指责不体面", "中方限制采购欧盟医疗器械影响多大", "罗马仕客服回应订单退款排到18万位", "伊朗称逮捕和击毙六名恐怖分子"]

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
