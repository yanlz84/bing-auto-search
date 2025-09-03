// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.270
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
var default_search_words = ["“把伟大抗战精神一代代传下去”", "总台直击九三阅兵", "新华社直播九三阅兵", "致敬伟大胜利", "大国重器已就位 现场轰鸣声不断响起", "一镜到底航拍阅兵方队", "受阅部队已在长安街列阵", "观众进入观礼台入座 不断“拍拍拍”", "这就是今天早上的天安门广场！", "抗战老兵提起战争经历时的眼神", "金正恩抵达纪念大会现场", "这是阅兵进场最早撤场最晚的队伍", "普京抵达纪念大会现场", "印尼总统凌晨抵京 中方表示欢迎", "盛大阅兵 就在今天", "纯享版现场原声：天安门广场礼炮就位", "我们为什么需要九三大阅兵", "“第零方阵”亮相长安街", "“别叫我们老英雄 叫一声同志就好”", "金正恩：很高兴时隔6年再次访华", "轰炸机列队完成整装待发", "阅兵现场受阅女民兵整理戎装", "阅兵现场“钢铁洪流”惊艳亮相", "天安门广场上空看现场", "天安门城楼国徽第四次换新装", "阅兵礼炮弹0污染", "她是新中国第一位女将军", "多家公司通知带薪放假看阅兵", "全家15人跨省送小伙去国防科大报到", "阅兵方队里的“三兵”是哪“三兵”", "洪秀柱笑称回台被批判无所谓", "九三阅兵亮点速览", "受阅舰载机整装待发", "1945年9月3日中国人永不能忘", "青岛一公司老板包场请员工看阅兵", "第一批复制粘贴照来了", "北京大街小巷悬挂国旗 全市喷泉开启", "应邀观礼的国际政要陆续抵达", "知名奶茶品牌小票火了 网友花式催更", "法国小伙马库斯在京分享会座无虚席", "空中护旗梯队直升机整装待发", "天安门广场旭日生辉", "56门礼炮今天将鸣放80响", "大国重器正褪去“神秘面纱”", "深圳一校长升旗仪式上连做71个俯卧撑", "不会PPT的优先 武汉一硕导招生帖走红", "外籍华人带姥爷参军照观礼九三阅兵", "长沙有家“奇葩”青旅：给钱不让住", "外交部回应乌克兰涉普京访华言论", "儿童指纹水杯是真靠谱还是智商税", "朝阳照耀下金水桥仪式感拉满"]

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
