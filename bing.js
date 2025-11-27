// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.440
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
var default_search_words = ["习近平向香港火灾遇难人员表示哀悼", "香港火灾44人遇难 3人涉误杀被捕", "中美元首近十年来首提军国主义", "全国入冬进程图来了", "深圳消防车队已在莲塘口岸集结", "疑女星前夫涉诈13.9亿 涉案资产拍卖", "净网：“千亩辣椒免费摘”系谣言", "香港多部门全力应对大埔火灾", "警方回应为何公布嫌犯王俊凯全名", "警惕！日本或迎“重大转变”", "香港大埔火灾不排除刑事案件可能性", "特朗普一通电话后 高市早苗只有沉默", "俄拒绝任何让步 乌不接受领土被占", "中国驻日本大使馆再发布提醒", "男子买刮刮乐中奖10万元老板不承认", "香港已出动超1000人灭火", "港澳办：全力支持香港特区政府救灾", "前湖北首富晒证据硬刚金龙鱼", "直击香港大埔火灾庇护中心", "众星为香港火灾受灾民众祈福", "前港姐冠军：看着奶奶的房子被烧光", "日月谭天：高市早苗必遭清算痛击", "35岁男子熬夜打游戏瞬间失明", "云南一荒野求生大赛被官方叫停", "中国军号发布视频：导弹起竖", "十秒分清甲流和普通感冒", "群演男演员因脑出血在出租屋去世", "全军统一制发《预备役人员证》", "心脏手术离世女婴已完成尸检", "港媒：宏福苑维修工程已支付逾亿港元", "“奇葩”公厕标识该规整了", "上海地铁回应多名外国人车内吃馅饼", "《疯狂动物城2》预售票房超《哪吒2》", "马克龙将访华 还想要大熊猫", "女子挑战不花钱生活 被餐馆老板教育", "当代孩子都在烦恼什么", "成都市市长王凤朝被查", "吉林长白山七彩祥云好梦幻", "美国两名警卫队员在白宫附近遭枪击", "事关飞机锁座 10家航司被约谈", "正直播NBA：雄鹿vs热火", "六部门：加强优质学生用品供给", "61岁儿子用车拉100岁父亲晨练", "惠普公司宣布：全球裁员约10%", "“未来黑科技”全固态电池到底是啥", "俄回应“和平计划”：绝无可能让步", "韩国发射自研运载火箭“世界”号", "柬埔寨重申坚决支持一个中国原则", "王楚钦孙颖莎获香港总决赛混双外卡", "铁钉在男子支气管内10年被取出", "国台办回应郑丽文忧虑"]

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
