// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.243
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
var default_search_words = ["总书记心系雪域高原", "得知俩孙子均非亲生后奶奶崩溃", "全球第5家千亿独角兽公司即将诞生", "9月3日阅兵活动安排公布", "研究生辞职后全职炒股：压力比工作大", "54岁夫妻柳“离婚”：树倒了 还活着", "净网：护航新学期 筑牢网络安全门", "女生在公司内用微波炉加热速冻饺子", "车主称50升油箱被加了67.96升汽油", "印度将为美国生产全系列iPhone 17", "富士康求职者排队百米：3个月能赚2万", "云南玉溪进城区须缴费200元？假", "老太每天凌晨“清空”爱心冰柜", "特朗普泽连斯基谈完 美军要动手了", "原配感谢闺蜜“照顾老公” 纪检介入", "外交部回应“外国领导人出席阅兵”", "内蒙古一景区保洁员遭多名游客殴打", "金建希问律师：我死才能救尹锡悦吗", "湖北一村民称干农活被老虎抓伤", "搜查犬疯狂嗅探装满零食的行李箱", "多地民办高校招生招不满", "男子被五步蛇咬 近两月了仍有余毒", "日军曾强迫塞班岛数千平民跳崖自尽", "LABUBU上新mini版 可挂手机上", "想靠团播暴富的00后已深陷债务危机", "李亚鹏名下嫣然医院被执行1381万", "本次阅兵将实现多个首次", "游客坐沙滩躺椅被催收费：1分钟1块", "两子非亲生当事人：堂哥送我二儿子房", "巨大“火球”飞越日本上空", "贾玲新作杀青 讲述主妇破获传销案", "云南大理一旅拍店疑私装信号屏蔽器", "北京共享充电宝新规：柜满可停止计费", "倪妮回应红毯造型：就是来玩的", "两子非亲生当事人和儿子冲突画面", "杨超越自曝近视700度", "钉钉回应“优化不主张加班的高管”", "董璇没觉得和张维伊领证仓促", "何猷君成NBA凯尔特人队小股东", "悟空热哪吒热之后是“钟馗热”吗", "九三阅兵这些旗帜将亮相", "瘦高女孩弯腰捡东西竟把肺“挤炸了”", "普京提议在莫斯科会晤 泽连斯基拒绝", "多地商场有了“父婴室”", "海军原参谋长李汉军涉嫌严重违纪违法", "26年“高龄飞机”直降88万再次拍卖", "女子入住酒店被长针扎伤 酒店回应", "失踪的梨泰院事件救援消防员已身亡", "动物园回应豹猫饭碗旁爬满虫子", "育儿补贴免征个人所得税", "中方回应美方称满意对华关税水平"]

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
