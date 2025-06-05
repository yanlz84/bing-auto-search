// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.90
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
var default_search_words = ["总书记心中“最宝贵的东西”", "特朗普全面暂停12国公民进入美国", "医院回应要求先献血再输血致人离世", "前四月民营经济总体发展稳中向好", "普京誓言回应乌军袭击俄机场", "大理5.0级地震 震感强烈网友被摇醒", "周渝民称单纯想赚钱不用找我", "李在明下达“一号行政令”", "老人自制电梯上5楼 多部门劝解拆除", "2025全国高考天气地图来了", "40℃高温要来了", "广西4.2级地震曝光致命隐患？假", "神曲《跳楼机》已吸金4000万", "张家界天坑溶洞垃圾已清理14吨", "曹骏谈年少爆红后突然消失", "普京和特朗普通话超1小时 聊了什么", "白象回应多半袋面的“多半”是商标", "被咬身亡女子亲戚：遗体还在病房", "特朗普签令 限制哈佛外国学生签证", "《潜伏》将拍电影版", "日本2024年出生人口不足70万", "如果没有他 高考或没有选择题", "港媒曝孙俪邓超将全家移民英国", "葡萄牙2-1逆转德国进欧国联决赛", "张馨予臀桥重量突破100斤", "安理会加沙决议草案遭美国一票否决", "何秋亊直播间爆粗口怼粉丝", "女生患不死癌症自学插胃管一次成功", "社区女书记开车追撵女子 警方通报", "美媒：空客与中国公司商议大订单", "《家有儿女》部分原班人马官宣拍短剧", "“苏超”爆火 “村超”怎么样了", "疑被蛇咬伤身亡女子是独生女", "古天乐连扑5部 新作豆瓣评分仅4.8", "白俄罗斯总统总结访华：不能再好了", "印尼公开赛国羽9胜2负", "C919完成支线机场商业首航", "17岁少女高考前查出白血病坚持学习", "残疾夫妇二胎查出先天性病症", "美教育部认定哥大违反反歧视法", "载3000辆汽车的轮船在太平洋起火", "上交所最新披露：新增156万户", "员工患病拒上夜班被开除获赔", "哈梅内伊：美方案\"损害伊朗利益\"", "乌全境安全形势严峻 中国使馆发声", "纳斯达克金龙中国指数初步收涨1.9%", "波音将花超13亿美元和解空难诉讼", "OpenAI预计今年营收为127亿美元", "杭州社保部门回应女性可提前退休", "美上诉法院阻止特朗普解散教育部", "涉密单位员工携秘密文件出境被截获"]

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
