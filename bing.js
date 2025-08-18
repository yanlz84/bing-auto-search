// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.238
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
var default_search_words = ["烽火乱世 弦歌不辍", "央视曝光直播间卖和田玉骗局", "1分惜败！中国男篮获亚洲杯亚军", "读懂7月我国经济运行态势", "坐高铁遇400斤邻座12306不该甩锅", "时隔10年 A股再现“双2万亿”", "三年多来首次 中国外长王毅今起访印", "73岁老人扛80斤特产辗转千里看儿孙", "微信转账记得加一个动作", "男子拒绝借宿被杀害 警方通报", "李连杰患甲亢", "房东税来了？多地紧急辟谣", "中方发表涉美重磅报告", "山洪致10死 唯一获救女孩刚高考完", "郭士强分析中国男篮亚洲杯输球原因", "中国医生救回“身首离断”患者", "30岁俄罗斯环球小姐因车祸离世", "上海浦东机场“箱子垫垫员”走红", "大理洱海12岁走失自闭症儿童已找到", "九三阅兵演练现场：武器装备亮相", "男子请育儿假陪幼女看病被开除", "女子踹男友下河致死获刑五年半", "清华博士庞众望：没有获300万奖学金", "起猛了 看到“兵马俑”跳舞了", "业主砌墙私占200平大堂已被拆除", "机器人史上首个百米“飞人”诞生", "胡明轩空砍26分遗憾错失绝杀", "厨师厨房闷一天患热射病 多器官衰竭", "多人下班兼职骑手：4小时收入60元", "3女子贵州买房避暑 被树砸致1死2伤", "内蒙古一充气城堡被掀翻 致10人受伤", "3岁女童头上插刀 系妈妈不慎刺入", "国庆中秋连休8天", "为何欧洲领导人要陪泽连斯基赴美", "机器人运动会惊现“火影跑”", "麦当劳奶昔炒疯 二手平台2杯卖150元", "亚洲杯决赛王俊杰连拿7分 解说疯狂", "馆长现身华强北：台湾要努力建设了", "一众欧洲领导人陪泽连斯基赴美谈判", "亚洲杯决赛 中国男篮最多时领先15分", "上海“马路股市沙龙”又火了", "常州队苏超首胜 整座城都沸腾了", "有些好笑的来时路每走一步也算数", "新西兰一警局收到中国样式锦旗", "内蒙古乌拉特后旗山洪已致10人遇难", "美乌总统会谈在即 欧洲为何急于参与", "馆长体验无人机车惊叹世界唯一", "中国男篮亚洲杯获近10年来最好成绩", "宇树科技获4×100米接力赛冠军", "阅兵演练复制粘贴夜间限定版", "特朗普：在俄问题上取得重大进展"]

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
