// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.323
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
var default_search_words = ["二十届四中全会10月20日至23日召开", "11人死刑！明家犯罪集团案一审宣判", "卖女孩的红烧肉招牌已拆除", "假期出行健康事项哪些要注意", "九寨沟结束不通高速历史", "演唱会已火到让铁路局加列车", "特斯拉员工被机器人打伤 索赔5100万", "蟋蟀成月饼馅 广东人：蟑螂馅不远了", "中方决定：增设K字签证", "舞者解晓东去世 曾摔伤脑部重度昏迷", "北京出现绝美七彩祥云", "网民用AI生成台风损毁房屋图片被罚", "妈妈因儿子成绩“三连跌”怒退机票", "乱港分子罗冠聪入境新加坡被拘", "58岁苏菲玛索被赞不老法拉利", "大量医疗论文造假背后的隐情", "“鸡排哥”爆红 是什么打动了网友", "清华两教职工当“黄牛”被拘", "内蒙古一女子称被老板锁办公室里打", "多只候鸟撞上大厦玻璃死亡", "DeepSeek-V3.2-Exp模型正式发布", "闫妮被辣评像一根发疯的香蕉", "辛芷蕾穿国际巨星T恤登vogue单封", "杭州一起27年前的命案积案告破", "说唱歌手诺米无证驾驶被行政拘留0天", "中欧班列“停摆”的13天", "女童上托班耳朵疑被撕裂 家长发声", "大暴雨、降温超10℃ 假期出行必看", "反手取消14天年假公司致歉", "外交部回应印度踩踏事件：深切哀悼", "受贿3.57亿 贵阳前市长陈晏被判死缓", "李在明向前总统挨个送中秋礼物", "湖北一景区野生猴群排队走钢丝渡江", "外交部：民进党当局必遭历史清算", "北京傍晚天空现神奇“光线”", "100多人中转站被赶下飞机滞留5小时", "被“限高”后私人飞机还能坐吗", "小孩就餐摔倒骨折 餐厅：不认同全责", "吊灯突然掉落 男子睡梦中被砸醒", "中方驳斥台方指控大陆干扰日方舰机", "孙颖莎赛前拿“金箍棒”训练", "中国23岁男游客在日本浮潜溺亡", "斯琴高娃坐轮椅出行被偶遇", "四川一初中8人宿舍住9名男生", "黄金饰品价格迈入“1100元+”时代", "世界容量最大超重力离心机启用", "泡泡玛特全明星阵容盲盒溢价超9倍", "万达回应王健林“限高”被取消", "两名15岁失联少女已被越南警方拦截", "新华社出图：这次是故宫", "西班牙王位女继承人重回大众视野"]

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
