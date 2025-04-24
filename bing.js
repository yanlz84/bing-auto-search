// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.6
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
var default_search_words = ["逐梦苍穹", "曝美对华关税或降至50%-65%", "大降对华关税 特朗普为何转弯", "神二十乘组简历来了", "你的手机可能正在泄密", "李现人生照片打卡处被封 景区回应", "银行职员诈骗1.6亿花6千万打赏主播", "王楠老公谈刘国梁辞职", "周杰伦演唱会480元票只能看大屏", "特斯拉利润暴跌71% 马斯克叹了口气", "韩国检方起诉前总统文在寅", "新疆5A级景区门票全免？假", "美10余州起诉特朗普政府滥用关税", "马龙这批球员为什么都不当教练了", "大理电子秤170克手机称出340克", "女子抓隐翅虫没洗手摸眼睛致红肿", "中国周边4国为何被美征最高3521%关税", "特朗普对华关税“松口”有何心思", "特朗普炮轰泽连斯基：他可以再打3年", "妻子拉黑病重丈夫 在其去世后争遗产", "陈坤晒怼脸素颜照 称已白发苍苍", "刘强东餐馆取外卖 老板没认出来", "保姆一声吼保住东家355万", "男生一瘸一拐出考场家长飞奔搀扶", "人社局回应求职者遭侮辱是下等人", "刘国梁说王励勤马龙是难得的人才", "重庆崽儿西藏自救后又上演硬核营救", "男子喝热水养生20年查出舌癌", "中方在联合国呼吁反对美国单边霸凌", "黄金价格“疯涨” 银行调高起投门槛", "导演汪俊说与孙俪合作默契", "万斯向乌克兰发出“最后通牒”", "重庆一幼儿园回应招聘教师要求硕士", "阿维塔06亮相上海国际车展", "伊朗谴责美最新制裁：缺乏谈判诚意", "CBA半决赛完整对阵出炉", "电视剧《佳偶天成》首发预告", "美股大幅收涨 纳指涨2.5%", "刘国梁说像是参加毕业典礼", "女子上厕所遭陌生男子闯入并反锁", "问界智能增程行驶总里程超124亿公里", "特朗普设“特朗普币大股东宴”", "雷霆主帅：我们还有潜力", "湖南卫视连发20条谭松韵", "甘肃高服回应服务区热水器设围栏", "孙颖莎感谢刘国梁：期待再次为我颁奖", "张继科说王励勤训练永远第一个到", "走红听障女生背后的MCN机构曝光", "美国能为菲律宾撑起“保护伞”吗", "毛剑卿：武磊的能力毋庸置疑", "中方回应白宫称中美谈判取得进展"]

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
