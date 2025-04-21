// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.28
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

var max_rewards = 50; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平向加蓬当选总统恩圭马致贺电", "美元跌麻了", "“假装上班公司”真的在上班", "聊到关税战 广东外贸女工眉毛一挑", "反诈老陈直播四天卖了100万", "中方回应普京宣布俄军暂时停火", "三案件揭侵犯个人信息犯罪产业链", "网红滕顺强夫妇被封号", "上架即秒光 2600亿元大市场爆发", "网红洋媳妇去世 老公向岳父母下跪", "肖战那英现身李健演唱会", "粤港澳两地牌全面取消？不实", "教皇方济各去世", "陈梦和张杰合影", "《哪吒3》殷夫人复活", "美团再回应：从未要求骑手二选一", "脑瘫女骑手送外卖7年送了7万多单", "广西气象干旱面积97.5%", "福州全城拉响警报", "意甲比赛因教皇方济各去世推迟", "美团再发长文开撕京东", "宁德时代推出第二代神行超充电池", "家属回应老人免密支付买了550只鸡崽", "X玖少年团赵磊婚礼邀请函曝光", "上海内环高架两车相撞 现场一片狼藉", "荣耀GTPro首发骁龙8至尊领先版", "小伙吃牛肉痛风发作肘疼4个月", "女子3个月狂减27斤被送急诊", "甲亢哥盛赞重庆城和“卤鹅叔”", "尹锡悦内乱案出庭受审画面曝光", "对话被前男友泼汽油致残案受害人", "黄金冲高市场震荡美元暴跌", "北京女排3:2越南平田隆安女排", "方文山透露周杰伦今年会出新专辑", "《无忧渡》半夏当面直球表白宣夜", "美国希望与俄乌本周达成协议", "任嘉伦宋祖儿跳星奇摇", "巴特勒19中10砍25分", "任嘉伦《无忧渡》追剧团跳星奇摇", "鹿晗关晓彤因戏生情的吻戏", "邓亚萍点评世界杯男单决赛", "超1200名经济学家签署反关税宣言", "月季花开正当时", "金价还会狂飙多久", "俄在印尼部署军机 澳政界激烈争论", "孙颖莎澳门冠军城市宣传照", "远洋渔船船长被害案船上视频曝光", "奥运一年后丢冠 谁来扛起男乒大旗", "爸爸用胶带把孩子“绑”在沙发上", "宋祖儿哭戏代入感好强", "宋祖儿工作室营业发图"]

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
    let randomDelay = Math.floor(Math.random() * 20000) + 10000; // 生成10秒到30秒之间的随机数
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
