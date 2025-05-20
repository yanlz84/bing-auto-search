// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.59
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
var default_search_words = ["中国式现代化要继续把制造业搞好", "广州警方对境外黑客案立案调查", "女生520收一屋子花 准备晚上摆摊", "今天起贷款利率下调", "父亲欠债300万儿子拒还 法院判了", "“存五年不如存一年”现象消失", "重庆一父亲带儿女钓鱼3人落水身亡", "北方多地地面温度已超70℃", "孟羽童称时隔两年收到董明珠微信", "男生掉化粪池身亡 父亲讲述细节", "新人在登记大厅打架？摆拍者被拘", "专家：新冠感染临床严重性无显著变化", "女子家被12台空调外机包围", "外交部：中方支持俄乌直接对话谈判", "六大行集体降息 楼市迎来利好", "S妈追债汪小菲 马筱梅回应：找律师", "专家谈六大行下调存款利率", "汪小菲感谢马筱梅爱北京 疑内涵大S", "10万元存一年利息将减少150元", "凤阳鼓楼坍塌楼宇部分系复建假古董", "汪顺潘展乐火力全开 张雨霏逐冠", "男演员多次性侵15岁少女致其染HPV", "四川慈善总会回应“230万耳环”事件", "王励勤为王楚钦球拍损坏事件发声", "重庆“救火骑士”龙麻子领证", "律师解析大学生化粪池遇难谁来担责", "顶刊论文现“飙脏话辱骂第二作者”", "外交部回应外媒称北斗挑战GPS地位", "长沙新人520领到超大版结婚证", "中方回应菲向非法“坐滩”军舰运补", "男子在家中建10米长鱼缸养巨骨舌鱼", "00后张子枫当选上影节评委", "白象被经销商“抛弃”", "国台办回应台领导人就职周年讲话", "印度展示印巴冲突中的战利品", "广东茂名惊现龙卷风", "格力回应网传孟羽童将与董明珠直播", "瓜帅：梅西是我见过最棒的球员", "印度空军为“阵风”换装国产导弹", "王楚钦球拍受损 裁判却称没关系", "王楚钦球拍为何接连出问题", "外交部回应“普京与特朗普通电话”", "格力回应孟羽童：欢迎回家吃饭", "曾黎风波后现身 见到粉丝哽咽落泪", "84岁老人替闺蜜相亲：我80岁有新老伴", "WKG综合格斗赛阿克苏站", "刘亦菲Lisa同框", "美债再遭大规模抛售", "马英九对赖清德提出三点建议", "王楚钦球拍受损原因将形成书面报告", "路人把徐志胜认成了许昕爸爸"]

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
