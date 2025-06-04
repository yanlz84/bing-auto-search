// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.89
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
var default_search_words = ["习近平向韩国当选总统李在明致贺电", "商家偷往猪肉上抹硼砂 拍摄者回应", "被咬身亡女子亲戚：遗体还在病房", "解锁丰收背后的科技密码", "神曲《跳楼机》已吸金4000万", "40℃高温要来了", "周杰伦强直性脊柱炎疑似加重", "三亚常见毒蛇为竹叶青眼镜蛇", "陈学冬车祸两年仍在做手术", "高考考生请注意！科学备考这样做", "女子被咬身亡涉事医院多次违规被罚", "广西4.2级地震曝光致命隐患？假", "高校通报因猥亵被处分男教师再任职", "苏超联赛迎来“场地大挪移”", "外交部：望日方深刻反省历史罪责", "陕西安康“985 211”路牌火了", "蜜雪冰城女店员不是因为爆单累哭的", "对郑钦文而言突破和遗憾都是养分", "房祖名罕见露面 秃顶暴瘦模样沧桑", "“苏超”爆火 “村超”怎么样了", "多地多场刘晓庆主演话剧取消", "亚朵酒店因医院枕套致歉", "台湾旅游团整团被卖到缅甸？泰方回应", "王楚钦问献花小女孩花不给我了吗", "西安一高楼起火 大火从底楼贯穿到顶", "黄晓明维权案开庭", "卢卡申科离京前表态", "罗森将用2023年大米制作饭团售卖", "中方回应中韩关系是否会改善", "以军称两枚火箭弹从叙射向戈兰高地", "多家赞助商回应“苏超”爆火", "南京回应苏超主场何时移师奥体", "河北一路面塌陷两辆车跌入坑中", "韩国总统李在明下达“一号行政令”", "外交部回应巴阿提升外交关系", "被蛇咬后千万不要用嘴吸", "年轻人争做毛绒玩具 押注下个Labubu", "乌无人艇试图袭击克里米亚大桥被拦", "酒店的问题枕套不能等消费者来发现", "李在明当选韩国总统后要做哪些事情", "李在明提名的韩国总理曾在清华留学", "韩国新第一夫人曾称“从政就离婚”", "多地宣布与高考时间重叠演出延期", "村干部回应有人上山放生五步蛇", "美经济唱衰 特朗普政府急下通牒", "侯佩岑发文告别《浪姐》", "限水憋尿 高三学生备考却伤了肾", "首个国产九价HPV疫苗获批上市", "家长28楼用铲子挡电梯门致幼童被困", "“结石姐”确诊乳腺癌 曾参加《歌手》", "女子放生2.5万斤外来鲇鱼被罚5.8万"]

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
