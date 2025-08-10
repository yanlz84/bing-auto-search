// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.223
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
var default_search_words = ["“体育强则中国强”", "纪念抗战胜利80周年大会演练画面", "现在西出阳关都是人", "4种藏在家里的致癌物", "没吃到蛋抱怨十几分钟的丈夫同意离婚", "为什么好多人包上都要挂一个玩偶", "月薪2万吃不起百果园", "车爆胎人未撤离 后车智驾追尾致2死", "国家安全部：王某已被果断采取措施", "中学生要去缅甸赚钱：有劳斯莱斯接", "张本智和“告状” 认为王皓握手敷衍", "卖不完的预制菜都给了中小学？假", "民宿老板：今年暑期怎么能淡成这样", "男单四强国乒仅剩王楚钦", "老板办252桌婚宴拒付52万元后续", "获救一家三口：没来得及说谢谢", "山东一动物园老虎翻围栏打“同事”", "90后干部现场忏悔：对不起父母和妻子", "巴基斯坦：印度连1架巴军机都没击中", "外国女游客在凤凰古城勇救落水男孩", "警方回应7岁小孩在苍山走失", "歌手伍佰发布紧急公告", "姜文31岁女儿婚礼现场曝光", "多人烧烤店外用餐遭楼上住户泼液体", "狂飙的山姆还在加速收割中产", "美国如何给芯片安“后门”", "“婚内强奸案”将开庭 男方姐姐发声", "舒淇发文为51岁冯德伦庆生", "实测九头身裁判到底是不是九头身", "杭州通报男子在演出场所猥亵女子", "中老年代言反向收割年轻人", "男子发12字评论被拘 当地启动调查", "下班送外卖到底图啥", "中专生未付实习费 被校方扣押档案", "被剐蹭小伙回应手机号被曝光", "游客途经茶楼被工作人员索要过路费", "英国防部隐瞒放射性废水泄漏入海", "饭店夜间占道经营 楼上居民泼辣椒水", "官方通报搜救大理走失8岁男童进度", "GPT-5放了个哑炮", "孙颖莎横扫大藤沙月晋级四强", "小猫被困路砖 “喵”声呼救", "英军F-35今日紧急迫降日本", "陈幸同逆转早田 国乒女单包揽四强", "女子单手骑车摔倒 相隔7米汽车担责", "救援人员发声苍山走失男童救援细节", "民警：未成年人学会逃脱罪责了", "蜜雪“平替”加盟商的血与泪", "网红陈一娜官宣领证结婚", "兰州一货车失控从山路冲下连撞多车", "王楚钦4-1户上隼辅 晋级男单4强"]

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
