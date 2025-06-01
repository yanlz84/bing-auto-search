// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.83
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
var default_search_words = ["你好！新时代少年", "俄大桥坍塌被定性恐袭 普京整夜关注", "深圳关于6月1日不许下雨的通知", "一组数据看人们端午出游都去哪了", "买基金亏损30万状告银行 法院判了", "一块“吧唧”被炒到7万多", "党员干部违规吃喝致死 中央点名通报", "福建平潭骆驼“瘦成纸片” 多方回应", "余承东“杀疯了” 台下助理直摆手", "董卿与儿子同台朗读", "巴基斯坦上将聊歼-10CE嘴角压不住", "吃“聪明药”能提高考试成绩？谣言", "孙中山长孙女在美国去世 享年103岁", "未休节假日只剩国庆中秋 将放8天", "为省30块钱 卡车司机在青海缺氧离世", "樊振东莫雷加德成为队友", "山西一货车疑失控致多车相撞受损", "俄罗斯桥梁坍塌 火车脱轨扭成麻花", "王晓晨被传与俞灏明结婚后首露面", "陈妍希离婚后首次晒娃", "小沈阳演出屏幕故障有观众喊退票", "零跑连续3个月新势力销量第一", "46岁缺氧离世卡车司机有6个孩子", "樊振东还会参加今年乒超联赛吗", "于东来回应坐过牢传言：胡编", "24小时内第2座 俄又一桥梁坍塌", "5月一二线城市新房价格环比上涨", "周深南京演唱会遇大雨被淋透", "回顾香港演员方刚经典作品", "雷军透露小米YU7预计7月量产", "被问中菲关系出路 菲律宾防长沉默了", "双腿戴假肢男子4小时登顶泰山", "演员贾冰减肥成功瘦到脱相", "印度网红直播猥亵土耳其导游", "印巴参谋长香会隔空交锋 互放狠话", "网红徐姥姥带你感受东北端午节", "外国女孩乘滑翔伞解开安全绳坠亡", "俄称两起桥梁坍塌均系爆炸引起", "俄坍塌桥梁均在与乌克兰接壤地区", "云南怒江沿岸有人捡水中浮木当柴烧", "余承东：按华为标准有的车厂发不了货", "陈雨菲22连胜刷新个人纪录", "端午档电影总票房破3亿", "猎德村龙舟文化与其他地区区别是什么", "比亚迪5月新能源车销量38.25万辆", "强降雨致云南一道路中断 有游客被困", "美媒：C919有望成波音竞争者", "鞠婧祎国内杂志销量第一", "俄西伯利亚地区军事基地首次遭袭", "西亚卡姆当选东决MVP", "李健演唱会遇暴雨全程不打伞"]

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
