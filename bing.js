// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.97
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
var default_search_words = ["习近平同缅甸领导人敏昂莱互致贺电", "高考生感谢老师：每道题都押中了", "北京高考英语作文又是李华", "赛事经济带动多场景消费升级", "女生考完英语称轻松拿捏：985稳了", "洛杉矶爆发冲突后 纽约也乱了", "浙江一村40多户养了上百万条蛇", "黄圣依向往进入下一段婚姻", "高考英语难度“杀疯了”", "许其亮遗体在京火化", "“韦神”家属：开账号因太多人冒用", "女子因偷两根小米辣被拘？假", "重庆通报“游客吃烧烤3人花780元”", "邓超用英文表白孙俪", "网传井柏然刘雯已领证", "今年高考物理难吗？", "印尼公开赛：国羽1金1银收官", "物理考试的压力给到了爱因斯坦", "朱雀玄武敕令称猜对作文：能拿40分", "南宁地铁宣传片被指低俗 当地回应", "2025高考英语难吗？权威解析", "男生连续3场第1个冲出考场", "河北定州高考监考老师都穿运动鞋", "《长安的荔枝》一骑红尘里的笑与悲", "威胁“有人拍照就打”村支书被停职", "高考生作弊家长用钱摆平？重庆回应", "中菲建交50年菲律宾举行灯光烟火秀", "葛军附体？今年数学卷难度分析", "俄军无人机用铁棍捅下乌无人机", "樊振东乒超赛前热身训练", "洛杉矶上千人围攻美联邦大楼", "叶童回应获总冠军：完成重要角色", "从数学不及格到上岸北大是啥体验", "俄军在第聂伯罗彼得罗夫斯克州推进", "周一周二高考继续", "沈阳飞上海航班起飞绕8圈后返航", "高考第二天考场外是什么样子的", "气象预报：北京中部等地较易发生中暑", "泰国女排3-1法国取首胜", "考生外婆跨越750公里来送考", "书法家雷珍民逝世", "“独行侠”豹猫频频亮相国家保护区", "美国恢复处理哈佛国际学生签证", "问界全系亮相重庆车展", "哥伦比亚总统候选人遭枪击 情况危急", "长沙一所大学宿舍因暴雨被淹", "英国拟斥资860亿英镑助力多领域研发", "绿泡泡为高考加油", "绿皮火车过隧道煤灰飞进车厢", "男生出考场第一句话是找不着妈妈了", "美国现役海军陆战队正高度戒备"]

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
