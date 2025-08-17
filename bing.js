// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.237
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
var default_search_words = ["使绿水青山产生巨大效益", "九三阅兵演练现场：武器装备亮相", "3岁女童头上插刀 系妈妈不慎刺入", "40℃又来了 这轮高温要持续多久", "多人下班兼职骑手：4小时收入60元", "赌王女儿何超云疑与未婚夫分手", "护网：不让科技偷走隐私 网警提示", "3女子贵州买房避暑 被树砸致1死2伤", "微信转账记得加一个动作", "四川啤酒节2死3伤 亲历者发声", "发现血枕头报警的外卖小哥找到了", "房东税来了？多地紧急辟谣", "辍学的00后正在扎堆改变世界", "女子踹男友下河致死获刑五年半", "普京为何与特朗普同乘专车？俄媒披露", "董宇辉曾回应年入28亿：辟谣跑断腿", "美国连体双胞胎姐妹其中一人疑生子", "厨师厨房闷一天患热射病 多器官衰竭", "中国男篮决战澳大利亚胜算几何", "赵露思怒斥寄居蟹行为 疑内涵虞书欣", "业主砌墙私占200平大堂？已拆除", "升旗前一只小鸟落在军人肩膀上", "李国庆大婚 张朝阳俞敏洪等人到场", "杭州咖啡店15万一只的树懒“逃跑”", "馆长现身华强北：台湾要努力建设了", "上海浦东机场“箱子垫垫员”走红", "男子请育儿假陪幼女看病被开除", "内蒙古乌拉特后旗山洪已致10人遇难", "馆长体验无人机车惊叹世界唯一", "船老大沈华忠获感动中国年度人物", "直击苏超：南京vs盐城", "12岁自闭症男孩大理走失 当地搜寻", "成都世运会中国36金17银11铜收官", "起猛了 看到“兵马俑”跳舞了", "长沙多个小区停水 水厂回应", "直击苏超：南通vs连云港", "新西兰一警局收到中国样式锦旗", "大学毕业生领养猫咪背上6720元猫贷", "62岁李连杰晒躺病床照片 面容憔悴", "有些好笑的来时路每走一步也算数", "直击苏超：扬州vs淮安", "以色列今日开始向加沙运送物资", "食客带狗不拴绳 店主提醒反被打", "婚礼这件大事正在变为“小事”", "后座男孩被压死缘何车企无责", "男子骑车撞上钢板被头盔救了一命", "美观众希望美国学校放《南京照相馆》", "高铁轻食套餐和一般盒饭有什么区别", "3女带4孩续面当事人将起诉面馆老板", "苏辙的院士后人投资33亿？官方回应", "俄媒公布特普会幕后视频"]

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
