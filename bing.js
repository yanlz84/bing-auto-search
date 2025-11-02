// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.390
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
var default_search_words = ["习近平同韩国总统李在明会谈", "马斯克称5年后不再有手机和App", "全球唯一！马尔代夫实施世代禁烟令", "11月新规一起了解", "中越五省省委书记齐聚 三个词很关键", "外交部回应日本领导人涉台错误言行", "日本男子为破杀妻案保存现场26年", "《沉默的荣耀》原型吴石之子档案公开", "又一家电巨头官宣造车", "中国人了不起！昨天上太空今天去南极", "泰州女主帅踢过世界杯", "网民编造“抢粮抢油”谣言被罚", "刘强东：从此在老婆面前没有了自信", "男子上班第一天害死同事 自称很冤", "尹锡悦因检察官直呼金建希名字大怒", "舅舅照顾3个外甥近10年 本人回应", "上海地铁回应老人强行坐女生腿上", "杨瀚森被下放发展联盟", "62岁著名音乐人屠颖突发意外离世", "世界唯一！中国核能科技实现新突破", "2025北京马拉松开赛", "下雨天的时候鸟都在干什么？", "驴友投喂野猴被飞踹 差点摔下山坡", "1%人口抽样调查查什么 怎么查", "美团骑手屏蔽恶意顾客功能全国上线", "安世中国郑重声明", "“前最帅央视主持人”复出", "林俊杰发文悼念屠颖", "万斯一句话 让印度裔美国人炸锅", "段永平回应捐高校1500万元茅台股票", "高燃！被空军的帅气混剪硬控了", "苏超公布最终射手榜", "南通队队长射失点球泪洒当场", "90后民警油罐车内救被困司机牺牲", "泰州队队员夺冠后手捧奖杯合影", "俄罗斯将驱逐2700名违法外国人", "南通唯一输的一场是决赛", "女子手镯10年未摘“长”进肉里", "韩国瑜互动王世坚再出金句", "泰州点球大战胜南通 夺苏超冠军", "美政府“停摆”还差3天追平最长纪录", "苏超决赛点球大战全程回顾", "4只小鼠“入住”空间站状态良好", "俄罗斯对乌克兰总理等官员实施制裁", "一觉醒来从河北到天宫了", "这件4000多年前的上古礼器有多绝", "中国记者用智能眼镜拍联合国记者会", "英国一火车突发持刀袭击 多人受伤", "南方暴雨大暴雨 北方气温多起伏", "前三季度GDP：中部地区很亮眼", "Uzi现身S15线下"]

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
