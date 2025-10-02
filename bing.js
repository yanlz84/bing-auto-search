// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.329
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
var default_search_words = ["习近平这些话饱含深情", "他的朋友圈永远是仅自己可见", "男子高速上和陌生大哥同行900公里", "复兴号都“拼起来”跑了", "第一批长假“受害哈基米”已出现", "“冒牌鸡排哥”连人带车被劝返", "网警提醒：国庆欢乐游 安全别松懈", "李在明痛批反华集会“有损国格”", "中国航母三舰齐辉", "万达电影发文致歉", "狗被车碾压因太胖毫发无损", "国庆别再被这些谣言骗局忽悠了", "男子假期出发2天还没到目的地", "高速堵车原因竟是路面撒满活鱼", "当你堵车时别人已经开飞机回家了", "被秋老虎“硬控”了", "女幼师出租屋遇害案凶手被执行死刑", "“驾驶员同志 车速提起来”", "演唱会出轨门男主戴婚戒与妻散步", "众星祝贺李纯马頔结婚", "杨宗纬右手骨裂肋骨断裂 本人回应", "韩国75万公务员约7年工作文件全没了", "泰国男子找回手机相册惊现尸骨照", "鸡排哥被指没有情绪价值后满血复活", "特斯拉汉堡销量碾压麦当劳", "李纯马頔领证结婚", "多省份发文：给特定人群发社保补贴", "世界第一高楼再度点亮“中国红”", "重庆开启宠客模式 洪崖洞封桥又封路", "APEC宣传片李在明权志龙张元英出镜", "#国庆各景区已开启人山人海模式#", "长沙女子买3C充电宝不到一周燃爆", "“鸡排保镖”的工作不好抢", "假期有酒店一天办了11场婚宴", "旅游打卡方式已经抽象成这样了吗", "俄伊全面战略伙伴关系条约正式生效", "石破茂卸任首相前拿了个奖", "高速堵车有人在路中间打起羽毛球", "鸡排哥称有摊主假冒已故父亲", "鸡排哥晒检验报告回应用油质疑", "李纯经纪人帮她和马頔组相亲局", "王楚钦3比0战胜安宰贤晋级8强", "王曼昱蒯曼进女双四强", "“馆长”看大陆网友创作歌曲流泪", "珍古道尔去世前一周采访", "美国政府停摆首日 数十万雇员停薪", "法国截停俄油轮 俄方称“不了解”", "郑州方特通报跳楼机高空悬停", "曝首款折叠屏iPhone明年9月发布", "韩阅兵表演失误 李在明面无表情鼓掌", "多名博主控诉网红以假换真偷包"]

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
